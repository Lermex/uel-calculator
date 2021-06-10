import { useState } from 'react'
import { takeWhile, dropWhile, sortBy } from 'ramda'

const Course = props => {
  return (
    <div className="flex">
      <div className="border border-black py-4 w-80">
        <h2 className="font-bold mx-2">{props.code} - <span>{props.name}</span></h2>
        {props.children}
      </div>
      <div className="text-blue-500 flex items-center justify-center ml-4 text-xl">
        {props.result && parseFloat(props.result.toFixed(2))}
      </div>
    </div>
  )
}

export default function Home() {
  const [inputs, setInputs] = useState([])

  const credits = {
    'CN6103': 45,
    'CN6107': 15,
    'CN6120': 15,
    'CN6121': 15,
    'CN6204': 15,
    'CN6211': 15,
  }

  const courseResults = inputs.reduce((acc, val) => {
    const normalizedValue = parseInt(val.value, 10) * (val.percentage / 100)
    if (acc[val.course]) {
      return {...acc, [val.course]: acc[val.course] + normalizedValue}
    } else {
      return {...acc, [val.course]: normalizedValue}
    }
  }, {})

  const sumCreditWeighted = (entries, creditSum) =>
    entries.reduce((acc, [course, courseResult]) => {
      return acc + (courseResult * credits[course] / creditSum)
    }, 0)

  const overallResult = sumCreditWeighted(Object.entries(courseResults), 120)

  const mkUntil90Predicate = () => {
    let taken = 0
    return ([course, courseResult]) => {
      const shouldTake = taken < 90
      taken += credits[course]
      return shouldTake
    }
  }

  const resultsSortedByBest = sortBy(([course, courseResult]) => -courseResult)(Object.entries(courseResults))

  const best90Courses = takeWhile(mkUntil90Predicate(), resultsSortedByBest)
  const best90Result = sumCreditWeighted(best90Courses, 90)

  const worst30Courses = dropWhile(mkUntil90Predicate(), resultsSortedByBest)
  const worst30Result = sumCreditWeighted(worst30Courses, 30)

  const renderInput = (course, percentage, title) => {
    const input = inputs.find(i => i.course === course && i.title === title)
    const onChange = (value) => {
      if (input) {
        setInputs(inputs.map(i => i.course === course && i.title === title ? {...i, value} : i))
      } else {
        setInputs([...inputs, {course, title, percentage, value}])
      }
    }
    return (
      <label className="block m-2">
        <div className="mb-2">{title}</div>
        <input
          className="border-b rounded"
          placeholder="Enter percentage here"
          value={input?.value ?? ''}
          onChange={e => onChange(e.target.value)}
        />
      </label>
    )
  }

  return (
    <div className="max-w-3xl mx-auto my-6">
      <h1 className="text-xl font-bold text-center mb-4">UEL 2021 Final Year Results Calculator</h1>

      <form className="grid grid-cols-2" onSubmit={e => e.preventDefault()}>

        <div className="">
          <Course code="CN6103" name="Project" result={courseResults['CN6103']}>
            {renderInput('CN6103', 25, 'Supporting Project Material (25%)')}
            {renderInput('CN6103', 75, 'Project Report (10,000 Words) (75%)')}
          </Course>

          <Course code="CN6107" name="Computer and Network Security" result={courseResults['CN6107']}>
            {renderInput('CN6107', 100, 'Component 1 2500-3000 Words (100%)')}
          </Course>

          <Course code="CN6120" name="Formal Methods" result={courseResults['CN6120']}>
            {renderInput('CN6120', 100, 'Individual Formal Specification Modelling And Testing Task (3000 Words) (100%')}
          </Course>

          <Course code="CN6121" name="Artificial Intelligence" result={courseResults['CN6121']}>
            {renderInput('CN6121', 100, 'Coursework (100%)')}
          </Course>

          <Course code="CN6204" name="Distributed Systems" result={courseResults['CN6204']}>
            {renderInput('CN6204', 50, 'Group Based Project (1500 Words Each) (50%)')}
            {renderInput('CN6204', 50, 'Examination (60 Minutes) (50%)')}
          </Course>

          <Course code="CN6211" name="Mobile Application Development" result={courseResults['CN6211']}>
            {renderInput('CN6211', 100, 'Group Development Task (1500 Words) (100%)')}
          </Course>
        </div>

        <div className="text-3xl font-bold text-center flex flex-col items-center justify-center">
          <div className="mb-5">
            <h2>Overall Result:</h2>
            {parseFloat(overallResult.toFixed(2))}
          </div>
          <div className="mb-5">
            <h2>Best 90 Credits:</h2>
            {parseFloat(best90Result.toFixed(2))}
          </div>
          <div className="mb-5">
            <h2>Worst 30 Credits:</h2>
            {parseFloat(worst30Result.toFixed(2))}
          </div>
        </div>

      </form>

    </div>
  )
}
