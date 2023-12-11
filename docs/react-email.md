## React Emails

react-emails is a package that allows for the creation of emails using React and TypeScript. For more info checkout the following links:

1. Website: https://react.email/
1. Github: https://github.com/resendlabs/react-email

## Development Email-Templates server

This package comes with a [CLI](https://react.email/docs/cli) that creates a dev server for you to view the emails.

1. Run the react-email development server that will run on `localhost:3001`

   ```sh
   npm run email
   ```

   - If you want to view images, you will also have to run the normal development server with `npm run dev`

1. Go to http://localhost:3001/ to view the email dashboard

1. react-email will only display the .tsx files in the base `emails` folder
   - The `templates` folder contains the templates that are called by the emailHandler
   - `/components/params.tsx` contains the mock data to view the email templates

npm run email creates a folder called .react-emails which contains the files needed for the dev server that displays the email templates. You can also treat this .react-emails folder as a normal project folder, meaning you can cd into the folder and run `npm i` and `npm run dev` to start the server. It is important to note that running `npm run email` in the root project will overwrite some of the folders in .react-emails, meaning any changes made to files like .react-email/package.json will be overwritten.

## Other CLI commands from react-emails
