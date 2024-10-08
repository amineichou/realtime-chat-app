# Realtime Chat App

A simple and scalable real-time chat application built using **React** and **Firebase**. This app supports real-time messaging between users, with user authentication and message storage via Firebase Firestore.

Check it out [https://cloudhangouts.web.app/](https://cloudhangouts.web.app/)

## Features

- Real-time messaging between users.
- Firebase authentication (Google, Email, etc.).
- Firebase Firestore for message storage.
- Responsive design for mobile and desktop.
- User-friendly interface with a clean layout.

## Screenshots

![Chat App Screenshot](https://cloudhangouts.web.app/ScreenShot_1.png)

## Technologies Used

- [React](https://reactjs.org/) - Frontend UI
- [Firebase Authentication](https://firebase.google.com/docs/auth) - User authentication
- [Firebase Firestore](https://firebase.google.com/docs/firestore) - Real-time database
- [Firebase Hosting](https://firebase.google.com/docs/hosting) - Deployment

## Getting Started

### Prerequisites

Make sure you have the following installed:

- Node.js
- Firebase CLI
- A Firebase project setup with Authentication and Firestore and Storage

### Installation

1. Clone the repository:

    ```bash
    git clone https://github.com/your-username/realtime-chat-app.git
    ```

2. Install dependencies:

    ```bash
    cd realtime-chat-app
    npm install
    ```

3. Create a `.env` file at the root of the project and add your Firebase configuration:

    ```bash
    REACT_APP_FIREBASE_API_KEY=your_api_key
    REACT_APP_FIREBASE_AUTH_DOMAIN=your_auth_domain
    REACT_APP_FIREBASE_PROJECT_ID=your_project_id
    REACT_APP_FIREBASE_STORAGE_BUCKET=your_storage_bucket
    REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
    REACT_APP_FIREBASE_APP_ID=your_app_id
    ```

4. Start the development server:

    ```bash
    npm start
    ```

### Firebase Setup

1. Go to the [Firebase Console](https://console.firebase.google.com/).
2. Create a new Firebase project.
3. Enable **Firebase Authentication** with the providers you need (Google, Email/Password, etc.).
4. Set up **Firestore Database** with appropriate rules for read/write access.
5. Get your Firebase configuration from the project settings and add it to your `.env` file.

### Deployment

To deploy your app using Firebase Hosting:

1. Install the Firebase CLI:

    ```bash
    npm install -g firebase-tools
    ```

2. Log in to Firebase:

    ```bash
    firebase login
    ```

3. Initialize Firebase in your project:

    ```bash
    firebase init
    ```

4. Deploy to Firebase Hosting:

    ```bash
    firebase deploy
    ```

## Contributing

If you'd like to contribute, feel free to fork the repository and submit a pull request. Any contributions are welcome!

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
