import os
import pandas as pd
import requests
import json
import re
import firebase_admin
from firebase_admin import credentials, firestore, storage
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

GROQ_API_KEY = os.getenv("GROQ_API_KEY")

if not GROQ_API_KEY:
    # Try reading manually if dotenv fails (fallback)
    try:
        with open('.env') as f:
            for line in f:
                if line.startswith("GROQ_API_KEY"):
                    GROQ_API_KEY = line.split("=")[1].strip().strip('"').strip("'")
                    break
    except:
        pass

if not GROQ_API_KEY:
    print("Error: GROQ_API_KEY not found in .env file.")
    exit(1)


# API Constants
API_URL = "https://api.groq.com/openai/v1/chat/completions"
MODEL = "groq/compound"
HEADERS = {
    "Authorization": f"Bearer {GROQ_API_KEY}",
    "Content-Type": "application/json"
}

# Initialize Firebase
cred = credentials.Certificate("smartretail-iot-firebase-adminsdk-fbsvc-7faa181ef1.json")
firebase_admin.initialize_app(cred)
db = firestore.client()

def get_product_image(product_id):
    """
    Fetches the image URL from Firebase for a given product ID.
    """
    try:
        # Check 'products' collection
        # Assuming product documents might have 'name' or similar field, or ID matches
        # Or look in 'images' collection if that's how it's structured.
        # Based on user request: "image urls from the firebase database take the urls that shares the comman database"
        
        # Searching in 'products' collection by Document ID (Product_ID)
        # Using product_id which should be passed to this function
        doc_ref = db.collection('products').document(str(product_id))
        doc = doc_ref.get()
        
        if doc.exists:
            data = doc.to_dict()
            if 'Image_URL' in data:
                return data['Image_URL']
            elif 'image_url' in data:
                return data['image_url']
            elif 'imageUrl' in data:
                return data['imageUrl']
            
        return "https://placehold.co/600x400?text=No+Image"
    except Exception as e:
        print(f"Error fetching image for {product_id}: {e}")
        return "https://placehold.co/600x400?text=Error"

def identify_categories(text, all_categories):
    """
    Identifies proper categories from the user input using Groq API.
    Expects JSON output with a list of categories.
    """
    categories_str = ", ".join(all_categories)
    try:
        payload = {
            "model": MODEL,
            "messages": [
                {
                    "role": "system",
                    "content": f"""You are a SMART CATEGORY MATCHER.
You have a list of available furniture categories: [{categories_str}]

Goal: Map the user's request (which might be in Tamil/Tanglish) to the most relevant categories from the list.

Rules:
1. Return ONLY categories that exist in the provided list.
2. If the user asks for "Chair" (or "Naarkali"), include 'Chair', 'Office Chair', 'Rocking Chair', 'Deck Chair', AND 'Bar Stool'.
3. If the user asks for "Shelf", include relevant shelving categories like 'Bookshelf', 'Wall Shelf', 'Shoe Rack'. Do NOT include 'Wardrobe' or 'Cabinet' unless explicitly asked.
4. If the user asks for "Table", include 'Coffee Table', 'Dining Table', 'Study Table', 'Console Table'.
5. Ignore filler words like 'inga', 'iruka'.
6. Return purely a JSON object with a key 'categories' containing the list of strings.

Example Output: {{"categories": ["Chair", "Bar Stool"]}}"""
                },
                {
                    "role": "user",
                    "content": text
                }
            ],
            "response_format": {"type": "json_object"}
        }
        
        response = requests.post(API_URL, headers=HEADERS, json=payload)
        
        if response.status_code == 200:
            data = response.json()
            content = data["choices"][0]["message"]["content"].strip()
            
            # Helper to extract JSON
            match = re.search(r'\{.*\}', content, re.DOTALL)
            if match:
                json_str = match.group(0)
                try:
                    json_content = json.loads(json_str)
                    return json_content.get("categories", [])
                except json.JSONDecodeError:
                    print(f"Failed to parse extracted JSON: {json_str}")
                    return []
            else:
                print(f"No JSON found in content: {content}")
                return []
        else:
            print(f"API Error: {response.status_code} - {response.text}")
            return []
            
    except Exception as e:
        print(f"Error identifying categories: {e}")
        return []

def search_products(selected_categories, user_query, df):
    """
    Filters the dataframe for the selected categories and refinement based on description.
    """
    if df is None or df.empty or not selected_categories:
        return pd.DataFrame()

    # Filter by category first
    results = pd.DataFrame()
    if 'Category' in df.columns:
        results = df[df['Category'].isin(selected_categories)]

    if results.empty:
        return results

    # Refine search using "Description" fields (excluding Product_Name)
    # columns to consider as "Description"
    desc_cols = ['Material_Type', 'Wood_Type', 'Usage_Type', 'Size_Description', 'Grade']
    available_desc_cols = [c for c in desc_cols if c in results.columns]

    if not available_desc_cols:
        return results

    # Simple keyword filtering: check if query keywords exist in any of the description columns
    # We won't filter strictly by keywords because the LLM already did the heavy lifting for Category.
    
    # Extract keywords from user query (very basic)
    ignore_words = ['show', 'me', 'a', 'the', 'and', 'with', 'for', 'in']
    keywords = [w.lower() for w in user_query.split() if w.lower() not in ignore_words]

    if not keywords:
        return results

    def row_matches(row):
        row_text = " ".join([str(row[c]) for c in available_desc_cols if pd.notna(row[c])]).lower()
        return any(k in row_text for k in keywords)

    # Apply filtering
    filtered_results = results[results.apply(row_matches, axis=1)]
    
    if not filtered_results.empty:
        return filtered_results
    
    return results

def main():
    # Load Database
    try:
        df = pd.read_excel('data.xlsx')
        # Get unique categories
        all_categories = df['Category'].dropna().unique().tolist()
        
    except Exception as e:
        print(f"Error loading database: {e}")
        return

    # Get User Input
    user_input = input("Enter product query (any language): ")
    if not user_input:
        print("Empty input.")
        return

    # Identify Categories
    selected_categories = identify_categories(user_input, all_categories)
    
    print("\n" + "="*40)
    print(f"Identified Categories: {', '.join(selected_categories)}")
    print("="*40 + "\n")

    # Search
    results = search_products(selected_categories, user_input, df)

    # Output Results
    if not results.empty:
        print(f"\nFound {len(results)} matches:")
        
        products_list = []
        
        # Select columns to display
        display_cols = ['Product_ID', 'Product_Name', 'Category', 'Price_Min_INR', 'Price_Max_INR', 'Stock_Quantity', 'Material_Type', 'Wood_Type', 'Size_Description']
        display_cols = [c for c in display_cols if c in results.columns]
        
        for idx, row in results.iterrows():
            print("-" * 20)
            product_data = {}
            for col in display_cols:
                val = row[col]
                print(f"{col}: {val}")
                # Handle NaN
                if pd.isna(val):
                    val = ""
                product_data[col] = val
            
            # Fetch Image
            image_url = get_product_image(row['Product_ID'])
            product_data['image_url'] = image_url
            print(f"Image URL: {image_url}")
            
            products_list.append(product_data)
            
            print("-" * 20)
            
        # Export to JSON
        output_path = os.path.join("d:\\Industrial Project\\product\\public", "products.json")
        try:
            os.makedirs(os.path.dirname(output_path), exist_ok=True)
            with open(output_path, 'w') as f:
                json.dump(products_list, f, indent=4)
            print(f"\nSuccessfully exported {len(products_list)} products to {output_path}")
        except Exception as e:
            print(f"Error exporting JSON: {e}")

    else:
        print("No products found for the matched categories.")
        # Clear the JSON file if no results
        output_path = os.path.join("d:\\Industrial Project\\product\\public", "products.json")
        try:
            if os.path.exists(output_path):
                 with open(output_path, 'w') as f:
                    json.dump([], f)
        except:
            pass

if __name__ == "__main__":
    main()
