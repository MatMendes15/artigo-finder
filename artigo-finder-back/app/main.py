from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .api import router

app = FastAPI(title="ArtigoFinder")

# Configurar CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], #prod
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Incluir rotas
app.include_router(router)

@app.get("/")
def read_root():
    return {"status": "online", "service": "ArtigoFinder"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="127.0.0.1", port=25000, reload=True)