import numpy as np
from scipy.stats import ks_2samp
from scipy.spatial.distance import jensenshannon
from typing import Optional


class DriftDetector:
    def __init__(self, drift_threshold: float = 0.05, psi_threshold: float = 0.2):
        self.drift_threshold = drift_threshold
        self.psi_threshold = psi_threshold

    def ks_test(self, reference: np.ndarray, current: np.ndarray) -> dict:
        if len(reference) == 0 or len(current) == 0:
            return {"drifted": False, "p_value": 1.0, "statistic": 0.0}

        statistic, p_value = ks_2samp(reference, current)
        return {
            "drifted": bool(p_value < self.drift_threshold),
            "p_value": float(p_value),
            "statistic": float(statistic),
            "threshold": self.drift_threshold,
        }

    def psi(self, reference: np.ndarray, current: np.ndarray, bins: int = 10) -> dict:
        if len(reference) == 0 or len(current) == 0:
            return {"drifted": False, "psi": 0.0}

        min_val = min(reference.min(), current.min())
        max_val = max(reference.max(), current.max())
        bin_edges = np.linspace(min_val, max_val, bins + 1)

        ref_counts, _ = np.histogram(reference, bins=bin_edges)
        cur_counts, _ = np.histogram(current, bins=bin_edges)

        ref_pct = ref_counts / len(reference)
        cur_pct = cur_counts / len(current)

        ref_pct = np.clip(ref_pct, 1e-8, 1.0)
        cur_pct = np.clip(cur_pct, 1e-8, 1.0)

        psi_value = np.sum((cur_pct - ref_pct) * np.log(cur_pct / ref_pct))

        return {
            "drifted": bool(psi_value > self.psi_threshold),
            "psi": float(psi_value),
            "threshold": self.psi_threshold,
        }

    def check_data_drift(self, reference_data: np.ndarray, current_data: np.ndarray,
                         feature_names: Optional[list[str]] = None) -> dict:
        if reference_data.ndim == 1:
            reference_data = reference_data.reshape(-1, 1)
        if current_data.ndim == 1:
            current_data = current_data.reshape(-1, 1)

        n_features = reference_data.shape[1]
        results = {}

        for i in range(n_features):
            ref_col = reference_data[:, i]
            cur_col = current_data[:, i]
            name = feature_names[i] if feature_names and i < len(feature_names) else f"feature_{i}"

            ks_result = self.ks_test(ref_col, cur_col)
            psi_result = self.psi(ref_col, cur_col)

            results[name] = {
                "ks_test": ks_result,
                "psi": psi_result,
                "drifted": ks_result["drifted"] or psi_result["drifted"],
            }

        total_drifted = sum(1 for v in results.values() if v["drifted"])
        return {
            "drift_detected": total_drifted > 0,
            "drifted_features": total_drifted,
            "total_features": n_features,
            "drift_ratio": total_drifted / n_features if n_features > 0 else 0,
            "feature_results": results,
        }
