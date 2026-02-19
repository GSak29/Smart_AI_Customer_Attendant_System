import pandas as pd
df = pd.read_excel('data.xlsx')
for col in df.columns:
    print(col)
