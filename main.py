from fastapi import FastAPI, APIRouter, Query, HTTPException, Request
from fastapi.templating import Jinja2Templates
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles


from typing import Optional, Any
import pandas as pd
from io import BytesIO
import requests

data_url = "https://docs.google.com/spreadsheets/d/\
12o1iofQx6V-UhInjUjLjpKxx3Z8ve8EGxnQtzNioIv4/export?\
format=xlsx&id=12o1iofQx6V-UhInjUjLjpKxx3Z8ve8EGxnQtzNioIv4"

df = pd.read_excel(
    BytesIO(requests.get(data_url).content)
)
# turn column names to lowercase
df = df.rename(columns={i: i.lower() for i in df})

df['claim_specialty'] = df['claim_specialty'].apply(lambda x: x.strip().lower() if not pd.isna(x) else x)

df['month'] = df['month'].astype(int)
df['year'] = df['month'] // 100
df['month'] %= 100 

df = df[df['month'] != 0]

def month_year_string_repr(row: pd.Series) -> str:
    month = row.month
    year = row.year
    return f"{year} - {'0' if month < 10 else ''}{month}"


df['year_month'] = df[['month', 'year']].apply(month_year_string_repr, axis=1)


TEMPLATES = Jinja2Templates(directory="./static")
app = FastAPI()
api_router = APIRouter()

app.mount("/static", StaticFiles(directory="./static"), name="static")


@api_router.get("/", status_code=200)
async def root(request: Request) -> dict:
    """
    Root GET
    """
    return TEMPLATES.TemplateResponse(
        "index.html",
        {"request": request, "recipes": None},
    )

@api_router.get("/notebook", status_code=200)
async def root(request: Request) -> dict:
    """
    Root GET
    """
    return TEMPLATES.TemplateResponse(
        "eastwood.html",
        {"request": request, "recipes": None},
    )

@api_router.get("/test", status_code=200)
def lol(request: Request) -> dict:
    return {'lol': 'kek'}


@api_router.get("/get_payers", status_code=200, response_class=JSONResponse)
def get_payers(request: Request) -> dict:
    return {'result': [*df['payer'].unique()]}


@api_router.get("/get_dates", status_code=200, response_class=JSONResponse)
def get_dates(request: Request) -> dict:
    return {'result': [*df['year_month'].unique()]}

@api_router.get("/get_top_claims/", status_code=200, response_class=JSONResponse)
def get_top_claims(payer: str, year_month: str, request: Request) -> dict:
    info = df[(df['payer'] == payer) & (df['year_month'] == year_month)]
    res = info.groupby('claim_specialty').size().sort_values(ascending=False)[:10]
    return {'x': [*res.index], 'y': [*res]}

@api_router.get("/get_top_service_category/", status_code=200, response_class=JSONResponse)
def get_top_service_category(payer: str, year_month: str, request: Request) -> dict:
    info = df[(df['payer'] == payer) & (df['year_month'] == year_month)]
    res = info.groupby('service_category').size().sort_values(ascending=False)[:10]
    return {'x': [*res.index], 'y': [*res]}

@api_router.get("/get_total/", status_code=200, response_class=JSONResponse)
def get_total(payer: str, year_month: str, request: Request) -> dict:
    info = df[(df['payer'] == payer) & (df['year_month'] == year_month)]
    
    res = info['paid_amount']
    return {'x': [*res]}

app.include_router(api_router)





if __name__ == "__main__":
    # Use this for debugging purposes only
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8002, log_level="debug")