## React Emails

react-emails is a package that allows for the creation of emails using React and TypeScript. For more info checkout the following links:

1. Website: https://react.email/
1. Github: https://github.com/resendlabs/react-email

## Development Email-Templates Server

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

## React-Email Commands

react-email comes with a `dev`, `build`, `start` and `export` command. The way these commands can be called are found within the `package.json` script.

The `dev`, `build` and `start` commands work like your normal npm commands, with the difference being that project it generates is a dashboard which shows your email templates. They create a folder called .react-emails which can essentially be treated as another project folder. It is important to note that running these commands in the will overwrite some of the folders in .react-emails, such as the package.json file.

`export` creates a folder called email-export containing the html renders for all the existing templates. It works similarly to how the render() function works.

## Deploying the email Dashboard

The problem when trying to deploy the dashboard was that `npm run build` was failing due to linting and typescript errors that exists in how `.react-email` imports the email templates

```sh
import Mail from '../../emails/PrivateCloudAdminCreateRequest.tsx';`
```

We can always update the config manually to ignore the above error, but the initial creation of the .react-email folder (if it does not already exist) will not include those changes. For that reason, our docker image will run `build` command twice. Once to generate the .react-email folder for our image, and once more after we update the next.config.js file with the following rule.

```sh
   typescript: {
      ignoreBuildErrors: true,
   },
```

The Dockerfile for the email-dashboard will then be pretty much the same as a normal deployment, with the exception of the context for `build` and `start`
