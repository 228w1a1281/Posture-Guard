import pickle
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.neighbors import KNeighborsClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, confusion_matrix, classification_report
from pycocotools.coco import COCO

def is_correct_posture(keypoints):
    # Function to determine if the posture is correct based on keypoints.
    left_shoulder = keypoints[5 * 2:5 * 2 + 2]  # Left shoulder (x, y)
    right_shoulder = keypoints[2 * 2:2 * 2 + 2]  # Right shoulder (x, y)

    # Example logic: Check if the left shoulder is above the right shoulder
    return left_shoulder[1] < right_shoulder[1]  # True if correct posture

# Load COCO dataset
coco = COCO('./annotations/person_keypoints_train2017.json')

# Get person category IDs and corresponding image and annotation IDs
person_ids = coco.getCatIds(catNms=['person'])
image_ids = coco.getImgIds(catIds=person_ids)
annotations = coco.loadAnns(coco.getAnnIds(imgIds=image_ids, catIds=person_ids))

# Prepare data
X, y = [], []
for ann in annotations:
    keypoints = ann['keypoints']
    keypoints = np.array(keypoints).reshape(-1, 3)  # x, y, visibility
    keypoints = keypoints[:, :2].flatten()  # Use only x, y coordinates

    # Check if keypoints are valid (at least one point should be visible)
    if np.any(keypoints):
        X.append(keypoints)
        y.append(0 if is_correct_posture(keypoints) else 1)  # 0: correct posture, 1: incorrect posture

# Convert lists to NumPy arrays
X = np.array(X)
y = np.array(y)

# Print shapes for debugging
print(f"Total samples: {len(X)}")
print(f"Features shape: {X.shape}")
print(f"Labels shape: {y.shape}")

# Split data into training and test sets
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# Print shapes after splitting for debugging
print(f"Training features shape: {X_train.shape}")
print(f"Testing features shape: {X_test.shape}")
print(f"Training labels shape: {y_train.shape}")
print(f"Testing labels shape: {y_test.shape}")

# Train the KNN model
knn = KNeighborsClassifier(n_neighbors=3)
knn.fit(X_train, y_train)

# Make predictions
y_pred = knn.predict(X_test)

# Calculate accuracy
accuracy = accuracy_score(y_test, y_pred)
print(f"Accuracy: {accuracy:.2f}")

# Obtain confusion matrix
conf_matrix = confusion_matrix(y_test, y_pred)
print("Confusion Matrix:")
print(conf_matrix)

# Classification Report
class_report = classification_report(y_test, y_pred)
print("Classification Report:")
print(class_report)

# Visualize Confusion Matrix
plt.figure(figsize=(8, 6))
sns.heatmap(conf_matrix, annot=True, fmt='d', cmap='Blues', xticklabels=['Correct Posture', 'Incorrect Posture'], yticklabels=['Correct Posture', 'Incorrect Posture'])
plt.xlabel('Predicted')
plt.ylabel('True')
plt.title('Confusion Matrix')
plt.show()

# Save the model as a pickle file
with open('./model/Nearest.sav', 'wb') as model_file:
    pickle.dump(knn, model_file)

print("Model trained and saved successfully.")
