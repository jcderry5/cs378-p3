import './App.css';
import React from 'react';
import { useState, useEffect } from 'react';


export default function WeatherApp() {
  const BASE_ATX_URL = "https://api.open-meteo.com/v1/forecast?latitude=30.27&longitude=-97.74&hourly=temperature_2m"
  const BASE_DAL_URL = "https://api.open-meteo.com/v1/forecast?latitude=32.78&longitude=-96.81&hourly=temperature_2m"
  const BASE_HOU_URL = "https://api.open-meteo.com/v1/forecast?latitude=29.76&longitude=-95.36&hourly=temperature_2m"
  const GEO_CODING_STUB = "https://geocoding-api.open-meteo.com/v1/search?name="
  const [time, setTime] = useState([]);
  const [temp, setTemp] = useState([]);
  let displayData
  

  async function pullJson(URL) {
    const response = await fetch(URL)
    const responseData = await response.json()
    let timeArr = responseData.hourly.time
    let tempArr = responseData.hourly.temperature_2m
    setTime(timeArr);
    setTemp(tempArr);
  }

  useEffect(() => {
    pullJson(BASE_ATX_URL)
    let cityHeader = document.getElementById("currentCityHeader");
    cityHeader.innerText = "Austin"
  }, []);

  function onClickATX() {
    pullJson(BASE_ATX_URL)
    let cityHeader = document.getElementById("currentCityHeader");
    cityHeader.innerText = "Austin"
  }

  function onClickDAL() {
    pullJson(BASE_DAL_URL)
    let cityHeader = document.getElementById("currentCityHeader");
    cityHeader.innerText = "Dallas"
  }

  function onClickHOU() {
    pullJson(BASE_HOU_URL)
    let cityHeader = document.getElementById("currentCityHeader");
    cityHeader.innerText = "Houston"
  }

  return (<>
    <div class="container">
      <ThreeCityButtons />
      <CityInput />
      <CurrentCityHeader />
      <ForecastHeader />
      < DataSet />
    </div>
  </>)

  function CityInput() {
    return (
      <div>
        <input type="text" id="searchCity" name="city" placeholder="Input City Name" />
        <button id="searchCityBtn" onClick={() => getCustomCity()}> Get Weather </button>
      </div>
    )
  }

  function getCustomCity() {
    const inputCity = document.getElementById("searchCity").value
    let cityHeader = document.getElementById("currentCityHeader");
    cityHeader.innerText = inputCity
    let encodedCityName = encodeURI(inputCity)
    const CUSTOM_URL = GEO_CODING_STUB + encodedCityName
    pullCustomJson(CUSTOM_URL)
  }

  async function pullCustomJson(URL) {
    const response = await fetch(URL)
    const responseData = await response.json()
    if (responseData.results != null) {
      let lat = responseData.results[0].latitude
      let long = responseData.results[0].longitude
      buildCustomJsonURL(long, lat)
    } else {
      alert ("Not a Valid City")
    }
  }

  function buildCustomJsonURL(long, lat) {
    const beginningURL = "https://api.open-meteo.com/v1/forecast?latitude="
    const middleURL = "&longitude="
    const endURL = "&hourly=temperature_2m&temperature_unit=fahrenheit"
    const CUSTOM_URL = beginningURL + lat + middleURL + long + endURL
    pullJson(CUSTOM_URL)
  }

  function ThreeCityButtons() {
    return (
      <div class="row">
        <div class="col">
          <button id="ATX-btn" class="cityBtn" onClick={onClickATX}> <b> Austin </b> </button>
        </div>
        <div class="col">
          <button id="DAL-btn" class="cityBtn" onClick={onClickDAL}> <b> Dallas </b> </button>
        </div>
        <div class="col">
          <button id="HOU-btn" class="cityBtn" onClick={onClickHOU}> <b> Houston </b> </button>
        </div>
      </div>
    )
  }

  function CurrentCityHeader() {
    let cityName = ""
    if (document.getElementById("currentCityHeader") == null) {
      cityName = "<Unknown City Name>"
    } else {
      cityName = document.getElementById("currentCityHeader").innerText
    }
    return (
      <div id="cityHeader">
        Weather for <var id="currentCityHeader"><b>{cityName}</b></var>
      </div>
    )
  }

  function ForecastHeader() {
    return (
      <div class="row forecast" >
        <div class="col-4">
          <b>Time</b>
        </div>
        <div class="col">
          <b>Temperature</b>
        </div>
      </div>
    )
  }

  function DataRow({ idx }) {
    let returnValue = ''
    if (temp.length != 0) {
      returnValue = (
        <div class="row forecast forecaseData">
          <div class="col-4">
            {time[idx].substring(11)}
          </div>
          <div class="col">
            {temp[idx]} F
          </div>
        </div>
      )
    } else {
      returnValue = <p> Nothing populated yet </p>
    }
    return (
      returnValue
    )
  }

  function DataSet() {
    const returnValue = [];
    for (let i = 8; i < 24; i++) {
      returnValue.push(<DataRow idx={i} />)
    }
    return returnValue
  }
  
}
