import "./style.css";
import axios from "axios";
import { z } from "zod";

const PizzaSchema = z.object ({
  id: z.number(),
  name: z.string(),
  toppings: z.string().array(),
  url: z.string(),
})

type Pizza = z.infer<typeof PizzaSchema>

type Order = {
  name: string,
  zipCode: string,
  items: {
    id: number,
    amount: number
  }[]
}

// app state
let isLoading = false
let pizzas: Pizza[] = []
let selectedPizza: Pizza | null = null
let amount = 0
let order: Order | null = null
let isSending = false

// mutation
const getPizzas = async () => {
  isLoading = true

  const response = await axios.get("http://localhost:3333/api/pizza")
  isLoading = false

  const result = PizzaSchema.array().safeParse(response.data)
  if (!result.success)
    pizzas = []
  else
    pizzas = result.data
}

const selectPizza = (id: number) => {
  selectedPizza = pizzas.find(pizza => pizza.id === id) || null
}

const updateAmount = (num: number) => {
  amount = num
}

const updateOrderWithItem = () => {
  order = order ? {
    name: order.name,
    zipCode: order.zipCode,
    items: [
      ...order.items.filter(item => item.id !== selectedPizza!.id),
      { id: selectedPizza!.id, amount }
    ]
  } : {
    name: "",
    zipCode: "",
    items: [
      { id: selectedPizza!.id, amount }
    ]
  }
}

const resetOrder = () => {
  order = {
    name: "",
    zipCode: "",
    items: []
}
}

const deleteItem = (id: number) => {
  if (order) {order = {
    name: order.name,
    zipCode: order.zipCode,
    items: [
      ...order.items.filter(item => item.id !== id),
    ]
  }
}
}

// render
const renderList = (pizzas: Pizza[]) => {
  const container = document.getElementById("list")!

  for (const pizza of pizzas) {
    const pizzaParagraph = document.createElement("p")
    pizzaParagraph.innerText = pizza.name
    pizzaParagraph.id = "" + pizza.id
    container.appendChild(pizzaParagraph)
    pizzaParagraph.addEventListener("click", selectListener)
  }
}

const renderSelected = (pizza: Pizza) => {
  const content = `
    <div>
      <h1>${pizza.name}</h1>
      <p class="bg-red-600">${pizza.toppings}</p>
      <img src="${pizza.url}" />
      <input type="number" id="amount" />
      <button id="add">Add to order</button>
    </div>
  `
  document.getElementById("selected")!.innerHTML = content
  document.getElementById("add")!.addEventListener("click", addListener);
  (document.getElementById("amount") as HTMLInputElement).addEventListener("change", changeListener)
}

const renderOrder = (order: Order) => {
  const content = `
    <div>
      <h1>Your order</h1>
      ${order.items.map(item => `
        <p class="bg-red-500">${item.amount} x ${pizzas.find(pizza => pizza.id === item.id)!.name}</p>
        <button id="delete-${item.id}">X</button>
        `)}
        <input placeholder="Name">
        <input placeholder="Zip code">
        <button>Send order</button>
        <button id="reset">Reset order</button>
    </div>
  `

  document.getElementById("order")!.innerHTML = content
  document.getElementById("reset")!.addEventListener("click", resetListener)
  let i = 0
  while(order.items[i] !== undefined){
    let item = order.items[i]
    document.getElementById(`delete-${item.id}`)!.addEventListener("click", deleteListener)
    i++
  }
}

// eventListeners
const init = async () => {
  await getPizzas()
  if (pizzas.length)
    renderList(pizzas)
}

const selectListener = (event: Event) => {
  selectPizza(+(event.target as HTMLParagraphElement).id)
  if (selectedPizza)
    renderSelected(selectedPizza)
}

const changeListener = (event: Event) => {
  updateAmount(+(event.target as HTMLInputElement).value)
}

const addListener = () => {
  updateOrderWithItem()
  if (order)
    renderOrder(order)
}

const deleteListener = (event: Event) => {
  deleteItem(+(event.target as HTMLButtonElement).id.split("-")[1])
  if (order)
    renderOrder(order)
}

const resetListener = () => {
  resetOrder()
  if (order)
    renderOrder(order)
}

init()

/* Feladatok
delete item
update name/zipCode 
send order

bonusz:
loading/sending kezelese
*/