import pandas as pd
df = pd.read_excel('data.xlsx')
for cat in sorted(df['Category'].unique()):
    print(cat)
