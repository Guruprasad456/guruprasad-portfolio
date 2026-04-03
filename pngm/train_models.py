from pathlib import Path
import pickle

import pandas as pd
from sklearn.calibration import CalibratedClassifierCV
from sklearn.ensemble import RandomForestClassifier, VotingClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score, roc_auc_score
from sklearn.model_selection import GridSearchCV, StratifiedKFold, train_test_split
from sklearn.neighbors import KNeighborsClassifier
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.svm import SVC


BASE_DIR = Path(__file__).resolve().parent
DATASET_PATH = BASE_DIR / "dataset" / "heart_data_set.csv"
MODEL_PATH = BASE_DIR / "models.pkl"


def tune_model(estimator, params, x_train, y_train):
    search = GridSearchCV(
        estimator=estimator,
        param_grid=params,
        scoring="roc_auc",
        cv=StratifiedKFold(n_splits=5, shuffle=True, random_state=42),
        n_jobs=-1,
        refit=True,
    )
    search.fit(x_train, y_train)
    return search.best_estimator_, search.best_score_, search.best_params_


def main() -> None:
    heart_data = pd.read_csv(DATASET_PATH).drop_duplicates()

    x = heart_data.drop(columns=["target"])
    y = heart_data["target"]

    x_train, x_test, y_train, y_test = train_test_split(
        x,
        y,
        test_size=0.2,
        random_state=42,
        stratify=y,
    )

    model_specs = {
        "lr": (
            Pipeline(
                [
                    ("scaler", StandardScaler()),
                    ("model", LogisticRegression(max_iter=3000, solver="liblinear")),
                ]
            ),
            {
                "model__C": [0.1, 1.0, 5.0, 10.0],
                "model__penalty": ["l1", "l2"],
            },
        ),
        "svm": (
            Pipeline(
                [
                    ("scaler", StandardScaler()),
                    ("model", SVC(probability=True)),
                ]
            ),
            {
                "model__C": [0.5, 1.0, 3.0],
                "model__kernel": ["linear", "rbf"],
                "model__gamma": ["scale", "auto"],
            },
        ),
        "knn": (
            Pipeline(
                [
                    ("scaler", StandardScaler()),
                    ("model", KNeighborsClassifier()),
                ]
            ),
            {
                "model__n_neighbors": [3, 5, 7, 9],
                "model__weights": ["uniform", "distance"],
            },
        ),
        "rf": (
            RandomForestClassifier(random_state=42),
            {
                "n_estimators": [200, 300],
                "max_depth": [None, 6, 10],
                "min_samples_split": [2, 4],
            },
        ),
    }

    tuned_models = {}
    metrics = {}

    for name, (estimator, params) in model_specs.items():
        best_model, cv_auc, best_params = tune_model(estimator, params, x_train, y_train)
        probabilities = best_model.predict_proba(x_test)[:, 1]
        predictions = (probabilities >= 0.5).astype(int)
        metrics[name] = {
            "cv_auc": round(cv_auc, 3),
            "test_auc": round(roc_auc_score(y_test, probabilities), 3),
            "test_accuracy": round(accuracy_score(y_test, predictions), 3),
            "best_params": best_params,
        }
        tuned_models[name] = best_model

    ensemble = VotingClassifier(
        estimators=[(name, model) for name, model in tuned_models.items()],
        voting="soft",
        n_jobs=-1,
    )
    ensemble.fit(x_train, y_train)

    ensemble_probabilities = ensemble.predict_proba(x_test)[:, 1]
    ensemble_predictions = (ensemble_probabilities >= 0.5).astype(int)
    metrics["ensemble"] = {
        "cv_auc": None,
        "test_auc": round(roc_auc_score(y_test, ensemble_probabilities), 3),
        "test_accuracy": round(accuracy_score(y_test, ensemble_predictions), 3),
        "best_params": "soft voting from tuned base models",
    }

    calibrated_ensemble = CalibratedClassifierCV(ensemble, method="sigmoid", cv=5)
    calibrated_ensemble.fit(x_train, y_train)

    calibrated_probabilities = calibrated_ensemble.predict_proba(x_test)[:, 1]
    calibrated_predictions = (calibrated_probabilities >= 0.5).astype(int)
    metrics["calibrated_ensemble"] = {
        "cv_auc": None,
        "test_auc": round(roc_auc_score(y_test, calibrated_probabilities), 3),
        "test_accuracy": round(accuracy_score(y_test, calibrated_predictions), 3),
        "best_params": "sigmoid calibration over soft voting ensemble",
    }

    bundle = {
        "models": tuned_models,
        "ensemble": ensemble,
        "calibrated_ensemble": calibrated_ensemble,
        "metrics": metrics,
        "feature_names": list(x.columns),
    }

    with open(MODEL_PATH, "wb") as model_file:
        pickle.dump(bundle, model_file)

    print(f"Saved models to: {MODEL_PATH}")
    for name, values in metrics.items():
        print(
            f"{name}: accuracy={values['test_accuracy']}, auc={values['test_auc']}, params={values['best_params']}"
        )


if __name__ == "__main__":
    main()
