# Curation Creation - <span title="Hosted on Netlify: https://curationcreation.netlify.app">([Demo](https://curationcreation.netlify.app/))</span>

### An app to allow users to explore online art and culture catalogues, and create their own exhibition from the objects they find.

Built over about 50 hours using Next.js, Typescript and Firebase - for the back-end authorization and data storage.

The two APIs used to access the online catalogues are provided by: [The V&A Museum](https://www.vam.ac.uk/) and [Europeana](https://www.europeana.eu/en).

Please visit the [demo](https://curationcreation.netlify.app/) hosted on Netlify. You can signup or use the test account - email: test@testEmail.com with password: test1234. Thanks for leaving any feedback or issues/bugs [here](https://github.com/lw1066/curationcreation/issues).

## Local setup instructions - If you prefer to run the app locally

Instructions for setting up and running the app on your local machine.

### Prerequisites

Before you begin, ensure you have the following installed on your machine:

- [Node.js](https://nodejs.org/en/download/) (version 14 or later)
- [Git](https://git-scm.com/downloads)
- A code editor (e.g., [Visual Studio Code](https://code.visualstudio.com/))

### Clone the Repository and install dependencies

Clone the repository(replace `<YOUR_REPO_URL>` with the actual URL of your GitHub repository):

```bash
git clone <YOUR_REPO_URL>
```

Navigate into the cloned repository folder:

```bash
cd curator
```

Once inside the project directory, install the project dependencies:

```bash
npm install
```

### Setting Up Firebase

1. Go to the Firebase Console.
2. Create a new project or select an existing one.
3. Ensure the project has both Authentication (with email/password) and Firebase Database configured.
4. In the project settings, get your Firebase configuration details (API Key, Auth Domain, Project ID, Storage Bucket, etc.).

If you haven't used firebase before [start here](https://firebase.google.com/docs/guides)

### Setting Up Europeana API Key

1. Go to the [Europeana API website](https://apis.europeana.eu/en).
2. Click on request an API key - follow instruction to request key.

### Configuring Environment Variables

1. Create a new file named `.env` in the root of your project directory.

2. Add the following required environment variables to the `.env` file:

```plaintext
EUROPEANA_API_KEY=your_europeana_api_key
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_firebase_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_firebase_app_id
```

Replace the placeholders with your actual Firebase configuration values and Europeana API key.

### Running the Development Server

Now everything is set up, start the development server:

```bash
npm run dev
```

The app should run locally on your machine.
