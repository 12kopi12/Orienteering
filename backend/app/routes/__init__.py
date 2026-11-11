from app.routes.auth import auth_bp
from app.routes.races import races_bp
from app.routes.categories import categories_bp
from app.routes.competitors import competitors_bp
from app.routes.entries import entries_bp
from app.routes.results import results_bp

blueprints = [
    auth_bp,
    races_bp,
    categories_bp,
    competitors_bp,
    entries_bp,
    results_bp,
]
