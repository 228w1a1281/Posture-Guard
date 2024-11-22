from flask import Flask, render_template, jsonify, request, redirect, url_for, session, flash
from flask_login import LoginManager, UserMixin, login_user, logout_user, current_user, login_required
from werkzeug.security import generate_password_hash, check_password_hash
from daily import daily_report
from database import get_alerts, init_db, log_alert
from model import render
import datetime
import pickle
import numpy as np

app = Flask(__name__)
app.secret_key = "your_secret_key"  # Required for session management

# Flask-Login setup
login_manager = LoginManager()
login_manager.init_app(app)
login_manager.login_view = 'home'  # Redirect to login page if not authenticated

user_db = {
    'user@example.com': {
        'name': 'User Name',
        'password': generate_password_hash('password123')  # Example hashed password
    }
}

global heap
heap = [0, 0, 0]

# Load the trained KNN model
with open('./model/Nearest.sav', 'rb') as model_file:
    knn = pickle.load(model_file)


# User class for Flask-Login
class User(UserMixin):
    def __init__(self, email):
        self.id = email


# Load user from session
@login_manager.user_loader
def load_user(user_id):
    if user_id in user_db:
        return User(user_id)
    return None


# Loading page
@app.route('/')
def loading():
    return render_template('loading.html')


# Home (login) page
@app.route('/home', methods=['GET', 'POST'])
def home():
    if request.method == 'POST':
        email = request.form.get('email')
        password = request.form.get('password')

        if email in user_db and check_password_hash(user_db[email]['password'], password):
            login_user(User(email))  # Log user in using Flask-Login
            session['email'] = email
            return redirect(url_for('menu'))  # Redirect to menu after login
        else:
            flash("Invalid email or password. Please try again.", "error")
            return render_template('home.html')

    return render_template('home.html')


# Sign-up page
@app.route('/signup', methods=['GET', 'POST'])
def signup():
    if request.method == 'POST':
        email = request.form.get('email')
        name = request.form.get('name')
        password = request.form.get('password')

        if email not in user_db:
            hashed_password = generate_password_hash(password)
            user_db[email] = {'name': name, 'password': hashed_password}
            login_user(User(email))  # Log user in using Flask-Login
            session['email'] = email
            return redirect(url_for('menu'))  # Redirect to menu after sign-up
        else:
            flash("User already exists! Please login.", "error")

    return render_template('signup.html')


# Menu page
@app.route('/menu')
@login_required
def menu():
    return render_template('menu.html')


# Profile page
@app.route('/profile')
@login_required
def profile():
    # Check if the user is authenticated
    if current_user.is_authenticated:
        user_email = current_user.id  # Get current user's email
        user = user_db.get(user_email)  # Get user data from the database

        if not user:
            return redirect(url_for('home'))  # Redirect if user not found

        return render_template('profile.html', user=user)
    else:
        return redirect(url_for('home')) 


# Edit profile page

@app.route('/edit_profile', methods=['GET', 'POST']) 
@login_required
def edit_profile():
    user_email = current_user.id  # Get the logged-in user's email or ID

    if request.method == 'POST':
        # Get form data
        name = request.form['name']
        email = request.form['email']
        password = request.form['password']

        # Update the user information in the database
        if user_email in user_db:
            user_db[user_email]['name'] = name
            if password:  # Update password only if provided
                user_db[user_email]['password'] = generate_password_hash(password)
            user_db[user_email]['email'] = email  # Update email if it's changed

            # Update session email if changed
            session['email'] = email  # Ensure the session uses the updated email

            flash('Profile updated successfully!', 'success')  # Flash message for success

        return redirect(url_for('profile'))  # Redirect to the profile page

    user = user_db.get(user_email)  # Get the current user's data
    return render_template('edit_profile.html', user=user)




# Performance Analysis page
@app.route('/performance')
@login_required
def performance():
    return render_template('performance.html')


# Daily summary page
@app.route('/daily_summary')
@login_required
def get_daily_summary():
    try:
        alerts = get_alerts()
        if alerts is None:
            alerts = []
        daily_summary = daily_report(alerts)
        return render_template('daily.html', alerts=daily_summary)
    except Exception as e:
        print(f"Error fetching daily summary: {e}")
        return render_template('error.html', error="Could not fetch the daily summary.")


# Work page (posture detection)
@app.route('/work')
@login_required
def work():
    return render_template('work.html')


# Detection page route
@app.route('/detection')
@login_required
def detection():
    return render_template('work.html')  # Redirects to work page


# Image info endpoint for posture detection
@app.route('/image_info', methods=['GET'])
@login_required
def image_info():
    global heap
    keypoints = eval(request.args.get('data'))
    state = render(keypoints)
    heap.append(state)
    heap = heap[1:]
    msg = 0
    if heap == [state] * 3:
        msg = 1
        heap = [0, 0, 0]
    return jsonify(state=state, msg=msg)


# Logout route
@app.route('/logout')
@login_required
def logout():
    logout_user()  # Log out using Flask-Login
    session.pop('email', None)  # Remove user session
    return redirect(url_for('home'))


if __name__ == "__main__":
    init_db()
    app.run(debug=True)
