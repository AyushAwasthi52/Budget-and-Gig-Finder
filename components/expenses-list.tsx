import { Coffee, ShoppingBag, Book, Film } from "lucide-react"

export function ExpensesList() {
  const expenses = [
    {
      id: 1,
      name: "Starbucks",
      category: "Food",
      amount: 5.75,
      date: "Today",
      icon: Coffee,
    },
    {
      id: 2,
      name: "Campus Bookstore",
      category: "Textbooks",
      amount: 49.99,
      date: "Yesterday",
      icon: Book,
    },
    {
      id: 3,
      name: "Target",
      category: "Shopping",
      amount: 23.45,
      date: "Apr 2",
      icon: ShoppingBag,
    },
    {
      id: 4,
      name: "Movie Theater",
      category: "Entertainment",
      amount: 15.0,
      date: "Apr 1",
      icon: Film,
    },
  ]

  return (
    <div className="space-y-4">
      {expenses.map((expense) => (
        <div key={expense.id} className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100">
              <expense.icon className="h-5 w-5 text-gray-600" />
            </div>
            <div>
              <p className="font-medium">{expense.name}</p>
              <p className="text-xs text-gray-500">
                {expense.category} • {expense.date}
              </p>
            </div>
          </div>
          <p className="font-medium">-${expense.amount.toFixed(2)}</p>
        </div>
      ))}
    </div>
  )
}

