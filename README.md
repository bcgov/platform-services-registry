[![Lifecycle:Maturing](https://img.shields.io/badge/Lifecycle-Maturing-007EC6)](https://github.com/bcgov/repomountie/blob/master/doc/lifecycle-badges.md)

This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started

First install the dependencies, note that you will need to use the `-f` flag:

```bash
npm install -f
```

Remember to set your environment variables in a `.env` file in the root of the project. You can use the `.env.example` file as a template. For a minimal setup, you will only need the `DATABSE_URL` variable and you can keep the other variables as they are in the `.env.example` file.

Then, run the development server:

```bash
npm run dev
```

Note that the home path is `http://localhost:3000/private-cloud/products`. The repo does not yet automatically redirect you to this path (as it is a work in progress), so you will need to manually navigate to it.

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.
