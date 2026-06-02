import sys, os
os.chdir(os.path.dirname(os.path.abspath(__file__)))
import numpy, sklearn, pandas, pickle, json
print('numpy:', numpy.__version__)
print('sklearn:', sklearn.__version__)
print('pandas:', pandas.__version__)

with open('models/model_a.pkl','rb') as f: ma = pickle.load(f)
with open('models/model_b.pkl','rb') as f: mb = pickle.load(f)
with open('models/encoders.pkl','rb') as f: enc = pickle.load(f)
with open('models/imputer.pkl','rb') as f: imp = pickle.load(f)
with open('models/pre_race_imputer.pkl','rb') as f: pre_imp = pickle.load(f)
print('All models loaded OK')
print('model_a type:', type(ma).__name__)
print('encoders keys:', list(enc.keys()))
for k,v in enc.items():
    print(f'  {k}: {type(v).__name__} first5={dict(list(v.items())[:5]) if isinstance(v,dict) else v}')

df = pandas.read_csv('models/race_features.csv')
print('CSV shape:', df.shape)
print('seasons:', sorted(df.season.unique()))
print('drivers:', sorted(df.driver_abbrev.unique()))
print('event sample:', df.event_name.unique()[:5].tolist())

# Check compound_encoded values
print('compound_encoded unique:', sorted(df.compound_encoded.unique()))
print('first_stint_compound unique:', sorted(df.first_stint_compound.dropna().unique()))
