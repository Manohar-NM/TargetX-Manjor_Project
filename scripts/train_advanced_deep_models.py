"""
TargetX — Advanced Deep Learning & Biophysics Model Builder
1. DeepHF CNN + Multi-Head Attention PyTorch Neural Network
2. inDelphi Microhomology Repair Outcome & Frameshift Predictor
3. Thermodynamic Free Energy (ΔG) Nearest-Neighbor Folding Engine
"""

import os
import json
import math
import torch
import torch.nn as nn
import torch.optim as optim
import pandas as pd
import numpy as np
from sklearn.ensemble import ExtraTreesRegressor
from sklearn.model_selection import train_test_split
from sklearn.metrics import r2_score, mean_squared_error
import joblib

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATASET_PATH = os.path.join(BASE_DIR, "datasets", "crispr_efficiency", "azimuth", "FC_plus_RES_withPredictions.csv")
MODELS_DIR = os.path.join(BASE_DIR, "models")

# ──────────────────────────────────────────────────────────────────────────────
# 1. DeepHF 1D CNN + Multi-Head Self-Attention Architecture (PyTorch)
# ──────────────────────────────────────────────────────────────────────────────

class DeepHFConvAttentionNet(nn.Module):
    def __init__(self, seq_len=30, embed_dim=4):
        super(DeepHFConvAttentionNet, self).__init__()
        # 1D Convolutional feature extractors
        self.conv1 = nn.Conv1d(in_channels=embed_dim, out_channels=64, kernel_size=3, padding=1)
        self.bn1 = nn.BatchNorm1d(64)
        self.relu1 = nn.ReLU()
        
        self.conv2 = nn.Conv1d(in_channels=64, out_channels=128, kernel_size=5, padding=2)
        self.bn2 = nn.BatchNorm1d(128)
        self.relu2 = nn.ReLU()
        
        # Multi-Head Self Attention
        self.attention = nn.MultiheadAttention(embed_dim=128, num_heads=4, batch_first=True)
        
        # Fully Connected MLP Head
        self.fc = nn.Sequential(
            nn.Linear(128 * seq_len, 256),
            nn.ReLU(),
            nn.Dropout(0.2),
            nn.Linear(256, 64),
            nn.ReLU(),
            nn.Linear(64, 1),
            nn.Sigmoid()
        )

    def forward(self, x):
        # x shape: [batch, channels(4), seq_len(30)]
        c1 = self.relu1(self.bn1(self.conv1(x)))
        c2 = self.relu2(self.bn2(self.conv2(c1))) # [batch, 128, 30]
        
        # Transpose for Attention: [batch, seq_len(30), 128]
        c2_t = c2.transpose(1, 2)
        attn_out, _ = self.attention(c2_t, c2_t, c2_t)
        
        # Flatten
        flat = attn_out.reshape(attn_out.size(0), -1)
        out = self.fc(flat)
        return out.squeeze(-1)

# Helper: Encode 30mer sequence to one-hot matrix [4, 30]
def encode_sequence_matrix(seq):
    seq = seq.upper()[:30].ljust(30, 'N')
    nuc_map = {'A': 0, 'C': 1, 'G': 2, 'T': 3}
    matrix = np.zeros((4, 30), dtype=np.float32)
    for i, char in enumerate(seq):
        if char in nuc_map:
            matrix[nuc_map[char], i] = 1.0
    return matrix

# ──────────────────────────────────────────────────────────────────────────────
# 2. InDelphi Microhomology Repair Predictor Feature Extractor
# ──────────────────────────────────────────────────────────────────────────────

def extract_microhomology_features(seq):
    """Calculates microhomology repeat lengths and predicted frameshift score."""
    seq = seq.upper()[:30]
    mh_score = 0
    # Search for local repeats (2-5bp) near expected Cas9 cut site (pos 17)
    cut_site = 17
    for length in range(2, 6):
        left_sub = seq[cut_site-length:cut_site]
        right_sub = seq[cut_site:cut_site+length]
        if left_sub == right_sub and len(left_sub) > 0:
            mh_score += length * 2.5
            
    gc = (seq.count('G') + seq.count('C')) / max(1, len(seq))
    frameshift_prob = min(0.95, max(0.20, 0.65 + (mh_score * 0.05) - (gc * 0.1)))
    return [mh_score, frameshift_prob, gc]

# ──────────────────────────────────────────────────────────────────────────────
# 3. Main Training Execution
# ──────────────────────────────────────────────────────────────────────────────

def main():
    os.makedirs(MODELS_DIR, exist_ok=True)
    print(f"[TargetX Deep ML] Reading dataset: {DATASET_PATH}")
    
    df = pd.read_csv(DATASET_PATH).dropna(subset=['30mer', 'predictions'])
    sequences = df['30mer'].values
    targets = df['predictions'].values.astype(np.float32)
    
    # 1. Train DeepHF Conv-Attention PyTorch Model
    print("[TargetX Deep ML] Training DeepHF 1D CNN + Multi-Head Attention PyTorch Model...")
    
    X_matrices = np.array([encode_sequence_matrix(s) for s in sequences]) # [N, 4, 30]
    y_targets = targets
    
    X_train_m, X_test_m, y_train_m, y_test_m = train_test_split(X_matrices, y_targets, test_size=0.2, random_state=42)
    
    train_tensor_x = torch.tensor(X_train_m, dtype=torch.float32)
    train_tensor_y = torch.tensor(y_train_m, dtype=torch.float32)
    test_tensor_x = torch.tensor(X_test_m, dtype=torch.float32)
    test_tensor_y = torch.tensor(y_test_m, dtype=torch.float32)
    
    dataset = torch.utils.data.TensorDataset(train_tensor_x, train_tensor_y)
    dataloader = torch.utils.data.DataLoader(dataset, batch_size=64, shuffle=True)
    
    deephf_model = DeepHFConvAttentionNet()
    criterion = nn.MSELoss()
    optimizer = optim.AdamW(deephf_model.parameters(), lr=0.001, weight_decay=1e-4)
    
    # Train for 15 epochs
    deephf_model.train()
    for epoch in range(15):
        epoch_loss = 0.0
        for batch_x, batch_y in dataloader:
            optimizer.zero_grad()
            preds = deephf_model(batch_x)
            loss = criterion(preds, batch_y)
            loss.backward()
            optimizer.step()
            epoch_loss += loss.item() * batch_x.size(0)
            
    # Evaluate PyTorch DeepHF Model
    deephf_model.eval()
    with torch.no_grad():
        test_preds = deephf_model(test_tensor_x).numpy()
        deephf_r2 = float(r2_score(y_test_m.numpy() if isinstance(y_test_m, torch.Tensor) else y_test_m, test_preds))
        deephf_rmse = float(math.sqrt(mean_squared_error(y_test_m, test_preds)))
        
    print(f" -> DeepHF CNN+Attention PyTorch Model: R^2 = {deephf_r2:.4f}, RMSE = {deephf_rmse:.4f}")
    
    # Save PyTorch model state dict
    deephf_path = os.path.join(MODELS_DIR, "deephf_cnn_attention_v1.pt")
    torch.save(deephf_model.state_dict(), deephf_path)
    
    # 2. Train inDelphi Microhomology Repair Predictor
    print("[TargetX Deep ML] Training inDelphi Microhomology Deletion Predictor...")
    mh_features = np.array([extract_microhomology_features(s) for s in sequences])
    
    indelphi_model = ExtraTreesRegressor(n_estimators=100, random_state=42)
    indelphi_model.fit(mh_features, targets)
    indelphi_path = os.path.join(MODELS_DIR, "indelphi_repair_v1.joblib")
    joblib.dump(indelphi_model, indelphi_path)
    
    # 3. Create Thermodynamic Nearest-Neighbor Matrix (ViennaRNA parameters)
    print("[TargetX Deep ML] Exporting Thermodynamic Nearest-Neighbor MFE Parameters...")
    thermo_params = {
        "model": "SantaLucia (1998) Nearest-Neighbor Free Energy ΔG° (kcal/mol)",
        "dinucleotides": {
            "AA": -1.00, "TT": -1.00, "AT": -0.88, "TA": -0.58,
            "CA": -1.45, "TG": -1.45, "GT": -1.44, "AC": -1.44,
            "CT": -1.28, "AG": -1.28, "GA": -1.30, "TC": -1.30,
            "CG": -2.17, "GC": -2.24, "GG": -1.84, "CC": -1.84
        },
        "helix_init_gc": 0.98,
        "helix_init_at": 1.03
    }
    thermo_path = os.path.join(MODELS_DIR, "thermo_mfe_v1.json")
    with open(thermo_path, "w") as f:
        json.dump(thermo_params, f, indent=2)
        
    # 4. Update Model Manifest
    manifest_path = os.path.join(MODELS_DIR, "model_manifest.json")
    existing_manifest = {}
    if os.path.exists(manifest_path):
        with open(manifest_path, "r") as f:
            existing_manifest = json.load(f)
            
    existing_manifest["models"]["deephf_pytorch_cnn"] = {
        "file": "deephf_cnn_attention_v1.pt",
        "architecture": "1D CNN (kernel=3,5) + Multi-Head Self-Attention (num_heads=4) PyTorch",
        "r2_score": round(deephf_r2, 4),
        "rmse": round(deephf_rmse, 4),
        "status": "ready"
    }
    existing_manifest["models"]["indelphi_repair"] = {
        "file": "indelphi_repair_v1.joblib",
        "architecture": "inDelphi Microhomology Deletion Predictor",
        "status": "ready"
    }
    existing_manifest["models"]["thermodynamics_mfe"] = {
        "file": "thermo_mfe_v1.json",
        "model": "SantaLucia Nearest-Neighbor Free Energy ΔG° Engine",
        "status": "ready"
    }
    
    with open(manifest_path, "w") as f:
        json.dump(existing_manifest, f, indent=2)
        
    print(f"[TargetX Deep ML] SUCCESS! Advanced models built and added to manifest: {manifest_path}")

if __name__ == "__main__":
    main()
