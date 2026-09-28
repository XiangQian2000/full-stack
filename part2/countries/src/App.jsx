import { useEffect, useState } from 'react'

const Weather = ({ capital, lat, lon }) => {
  const [weather, setWeather] = useState(null)

  useEffect(() => {
    const apiKey = import.meta.env.VITE_WEATHER_API_KEY

    fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`
    )
      .then((response) => response.json())
      .then((data) => {
        setWeather(data)
      })
  }, [lat, lon])

  if (weather === null) {
    return <p>Loading weather...</p>
  }

  if (weather.cod !== 200) {
    return <p>Weather data is not available yet.</p>
  }

  return (
    <div>
      <h3>Weather in {capital}</h3>

      <p>temperature {weather.main.temp} Celsius</p>

      <img
        src={`https://openweathermap.org/img/wn/${weather.weather[0].icon}@2x.png`}
        alt={weather.weather[0].description}
      />

      <p>wind {weather.wind.speed} m/s</p>
    </div>
  )
}

const Country = ({ country }) => {
  const languages = Object.values(country.languages)
  const capital = country.capital[0]
  const lat = country.capitalInfo.latlng[0]
  const lon = country.capitalInfo.latlng[1]

  return (
    <div>
      <h2>{country.name.common}</h2>

      <p>capital {capital}</p>
      <p>area {country.area}</p>

      <h3>languages:</h3>

      <ul>
        {languages.map((language) => (
          <li key={language}>{language}</li>
        ))}
      </ul>

      <img src={country.flags.png} alt={`Flag of ${country.name.common}`} />

      <Weather
        capital={capital}
        lat={lat}
        lon={lon}
      />
    </div>
  )
}

const Countries = ({ countries, filter, onShow }) => {
  if (filter === '') {
    return null
  }

  if (countries.length > 10) {
    return <p>Too many matches, specify another filter</p>
  }

  if (countries.length === 1) {
    return <Country country={countries[0]} />
  }

  return (
    <div>
      {countries.map((country) => (
        <p key={country.cca3}>
          {country.name.common}{' '}
          <button onClick={() => onShow(country.name.common)}>
            show
          </button>
        </p>
      ))}
    </div>
  )
}

const App = () => {
  const [countries, setCountries] = useState([])
  const [filter, setFilter] = useState('')

  useEffect(() => {
    fetch('https://studies.cs.helsinki.fi/restcountries/api/all')
      .then((response) => response.json())
      .then((data) => {
        setCountries(data)
      })
  }, [])

  const handleFilterChange = (event) => {
    setFilter(event.target.value)
  }

  const showCountry = (countryName) => {
    setFilter(countryName)
  }

  const countriesToShow = countries.filter((country) => {
    return country.name.common
      .toLowerCase()
      .includes(filter.toLowerCase())
  })

  return (
    <div>
      find countries{' '}
      <input value={filter} onChange={handleFilterChange} />

      <Countries
        countries={countriesToShow}
        filter={filter}
        onShow={showCountry}
      />
    </div>
  )
}

export default App