import { useState } from 'react'

const App = () => {
  const anecdotes = [
    'If it hurts, do it more often.',
    'Adding manpower to a late software project makes it later!',
    'The first 90 percent of the code accounts for the first 90 percent of the development time... The remaining 10 percent accounts for the other 90 percent.',
    'Any fool can write code that a computer can understand. Good programmers write code that humans can understand.',
    'Premature optimization is the root of all evil.',
    'Debugging is twice as hard as writing the code in the first place.',
    'Programming without an extremely heavy use of console.log is like a doctor refusing to use x-rays or blood tests.',
    'The only way to go fast, is to go well.',
  ]

  const [selected, setSelected] = useState(0)
  const [votes, setVotes] = useState(new Array(anecdotes.length).fill(0))

  const showRandomAnecdote = () => {
    const randomIndex = Math.floor(Math.random() * anecdotes.length)
    setSelected(randomIndex)
  }

  const voteForAnecdote = () => {
    const copy = [...votes]
    copy[selected] += 1
    setVotes(copy)
  }

  const mostVotedIndex = votes.indexOf(Math.max(...votes))

  return (
    <div>
      <h1>Anecdote of the day</h1>
      <p>{anecdotes[selected]}</p>
      <p>has {votes[selected]} votes</p>

      <button onClick={voteForAnecdote}>vote</button>
      <button onClick={showRandomAnecdote}>next anecdote</button>

      <h1>Anecdote with most votes</h1>
      <p>{anecdotes[mostVotedIndex]}</p>
      <p>has {votes[mostVotedIndex]} votes</p>
    </div>
  )
}

export default App