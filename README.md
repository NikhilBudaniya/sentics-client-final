# sentics

## Steps  to configure Tailwind CSS
* Install necessary packages.
    ```sh
    npm install -D tailwindcss postcss autoprefixer
    ```
* Initialize Tailwind CSS
    ```sh
    npx tailwindcss init -p
    ```
* Edit "tailwind.config.js"
    ```txt
    /** @type {import('tailwindcss').Config} */ 
    module.exports = {
    content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    ],
    theme: {
      extend: {},
    },
    plugins: [],
    }
    ```
* Some necessary imports to add in "index.css"
    ```txt
    @tailwind base;
    @tailwind components;
    @tailwind utilities;
    ```

## Steps to configure Redux
* Install necessary packages.
    ```sh
    npm install @reduxjs/toolkit
    npm install redux
    npm install react-redux
    npm install redux-thunk
    ```
    or
    ```sh
    yarn add @reduxjs/toolkit
    yarn add redux
    yarn add react-redux
    yarn add redux-thunk
    ```
* Configure the store in "index.js"