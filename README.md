# ANIMENG
English learning website for kids, inspired by Duolingo

## Requirements: 
- [NodeJs](https://nodejs.org/en/download)
- Dependencies listed in package.json

```
git clone https://github.com/TTN-ATTN/animeng.git
cd animeng
npm install
```

## Run locally:
Make sure that your current working directory is **animeng**
Run the following command:
```
npm run dev
```
Access the website on your local machine: http://localhost:3000

## Run Payment method
``` stripe login
    stripe listen --forward-to localhost:3000/api/webhooks/stripe
```
