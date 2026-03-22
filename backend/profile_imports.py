import time
print("Starting import profiling...")

def profile_import(name):
    start = time.time()
    try:
        __import__(name)
        print(f"Import {name} took {time.time() - start:.2f}s")
    except Exception as e:
        print(f"Import {name} FAILED: {e}")

profile_import("app.core.config")
profile_import("app.core.database")
profile_import("app.models.user")
profile_import("app.models.contract")
profile_import("app.routers.auth")
profile_import("app.services.extraction")
profile_import("app.services.nlp")
profile_import("app.services.rag_service")
profile_import("app.routers.contracts")
profile_import("main")
