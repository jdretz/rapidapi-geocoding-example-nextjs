import fetch from 'isomorphic-unfetch'

export default async (req, res) => {
    // Destructure incoming request
    const {
        method,
        body
    } = req

    // formats incoming input to be used as URL
    const encodedAddress = encodeURI(body.address)

    // use switch to handle request type
    switch (method) {
      case 'POST':
          try {
                // Gets coordinates for input address
                const currentLocation = await fetch(`https://google-maps-geocoding.p.rapidapi.com/geocode/json?language=en&address=${encodedAddress}`, {
                    "method": "GET",
                    "headers": {
                    "x-rapidapi-host": "google-maps-geocoding.p.rapidapi.com",
                    "x-rapidapi-key": process.env.RAPIDAPI_KEY
                    }
                })

                // creates json object
                const locationData = await currentLocation.json();

                // extracts needed location data
                const lat = locationData.results[0].geometry.location.lat
                const long = locationData.results[0].geometry.location.lng

                // gets attractions based on lat long variables
                const attractions = await fetch(`https://tripadvisor1.p.rapidapi.com/attractions/list-by-latlng?lunit=km&currency=USD&limit=10&distance=10&lang=en_US&longitude=${long}&latitude=${lat}`, {
                    "method": "GET",
                    "headers": {
                        "x-rapidapi-host": "tripadvisor1.p.rapidapi.com","x-rapidapi-key": process.env.RAPIDAPI_KEY
                    }
                })

                // creates json object
                const attractionsData = await attractions.json()

                // extracts list from response
                const attractionsList = attractionsData.data

                // returns data with HTTP status 200
                res.status(200).json({
                    lat,
                    long,
                    attractionsList
                })
          } catch (e) {
              // returns bad request error if something goes wrong
              res.status(400).send()
          }
        break
      default:
        // if request is not POST method return HTTP status code 405
        res.setHeader('Allow', ['POST'])
        res.status(405).end(`Method ${method} Not Allowed`)
    }
  }