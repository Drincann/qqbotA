# qqbotA

qqbot based on [Mirai-js](https://github.com/Drincann/Mirai-js).

## build

```sh
npm i
npx tsc
```

## run

```sh
ts-node .
```

or

```sh
node dist
```

## debug

```sh
node  --inspect=0.0.0.0:${debugPort} -r ./node_modules/ts-node/register .
```

or vscode run script debug.
