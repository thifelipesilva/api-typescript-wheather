import { StormGlass } from '@src/clients/stormGlass';

import axios from 'axios';

import stormGlassWeather3HoursFixture from '@test/fixtures/stormglass_weather_3_hours.json';
import stormglassNormalized3HoursFixture from '@test/fixtures/stormglass_normalized_response_3_hours.json';

jest.mock('axios');

describe('StormGlass client', () => {

  //juntando o tipo do jets com o  tipo axios para  utilizas as propriedades no ts mockedAxios.get.mockResolvedValue - inferencia de tipos?
  const mockedAxios = axios as jest.Mocked<typeof axios>; 

  //resposta ok da requisicao para Api storm glass
  it('should return the normalized forecast from the StormGlass service', async () => {
    const lat = -33.792726;
    const lng = 151.289824;

    /**
     * axios.get = jest.fn().mockResolvedValue({ data: stormglassWeatherPointFixture });
     * const stormGlass = new StormGlass(axios);      
    */

    mockedAxios.get.mockResolvedValue({ data: stormGlassWeather3HoursFixture });
    const stormGlass = new StormGlass(mockedAxios);
    const response = await stormGlass.fetchPoints(lat, lng);
    expect(response).toEqual(stormglassNormalized3HoursFixture);

  });

  //resposta para quando os dados chegarem incompletos
  it('Should exclude incomplete data points', async () => {
    const lat = -33.792725;
    const lng = 151.289824;

    const incompleteResponse = {
      hours: [
        {
          windDirection: {
            noaa: 300,
          },
          time: '2020-04-26T00:00:00+00:00',
        }
      ]
    };

    mockedAxios.get.mockResolvedValue({ data: incompleteResponse });

    const stormGlass = new StormGlass(mockedAxios);
    const response = await stormGlass.fetchPoints(lat, lng);

    expect(response).toEqual([]);
  });

  //resposta para erro na requisição antes de chegar na API storm glass
  it('should get a generic error from StormGlass service when the request fail before reaching the service', async () => {
    const lat = -33.792725;
    const lng = 151.289824;

    mockedAxios.get.mockRejectedValue({ message: 'Network Error' });

    const stormGlass = new StormGlass(mockedAxios);

    await expect(stormGlass.fetchPoints(lat, lng)).rejects.toThrow('Unexpected error when trying to communicate to StormGlass: Network Error');
  });

  //resposta pra erro na resposta do servidor da API storm glass
  it('should get an StormGlassResponseError when the StormGlass service with error', async () => {
    const lat = -33.792725;
    const lng = 151.289824;

    mockedAxios.get.mockRejectedValue({
      response: {
        status: 429,
        data: { errors: ['Rate limit reached'] },
      },
    });

    const stormGlass = new StormGlass(mockedAxios);
    
    await expect(stormGlass.fetchPoints(lat, lng)).rejects.toThrow(
      'Unexpected error returned by the StormGlass service: Error: {"errors":["Rate limit reached"]} Code: 429'
    );
  })
});
