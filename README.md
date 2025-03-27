# Why?

Umm. No good reason to use this. Have fun with it though :_)

# How to use?

Create a `.env` file and put in your openapi key as follows:

```
OPENAI_API_KEY=######
```

Then simply run 
`npm install`

Then run
`npm run dev`

# How to edit?

Just edit the `index.html` file. When ever you want raw js to be generated use the ai="" data attribute on an html element.

For example lets say you wanted a button that changed the background color of anything with the class change-color to red just do 

```html
<button id="change-background-color" ai="When pressed change the background color of any class with change-color to red">Change color</button>
```
