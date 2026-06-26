from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd
import os
from validator import validar_codigo_11_digitos

app = FastAPI(title="StripeID Core API")

# Habilita el puente de comunicación entre el dominio de GitHub Pages (HTTPS) y tu entorno local
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

EXCEL_PATH = "inventario.xlsx"

def buscar_en_excel(codigo: str):
    if not os.path.exists(EXCEL_PATH):
        return None
    try:
        df = pd.read_excel(EXCEL_PATH, dtype={"codigo": str})
        producto = df[df["codigo"] == codigo]
        if not producto.empty:
            return producto.iloc[0].to_dict()
        return None
    except Exception as e:
        print(f"🚨 Error de lectura en la tabla Excel: {e}")
        return None

@app.get("/scan/{codigo}")
async def escanear_codigo(codigo: str):
    if len(codigo) != 11:
        raise HTTPException(status_code=400, detail="Estructura incorrecta. Se requieren 11 dígitos.")
        
    if not validar_codigo_11_digitos(codigo):
        raise HTTPException(status_code=422, detail="Código rechazado. Falló el algoritmo de autenticación.")
        
    datos_producto = buscar_en_excel(codigo)
    if not datos_producto:
        raise HTTPException(status_code=404, detail="El producto no figura en el inventario de la tienda.")
        
    return {
        "status": "success",
        "producto": datos_producto
    }
