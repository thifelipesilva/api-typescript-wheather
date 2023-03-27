import { StormGlass } from '@src/clients/stormGlass';
import stormGlassWeather3HoursFixture from '@test/fixtures/stormglass_weather_3_hours.json';
import stormglassNormalized3HoursFixture from '@test/fixtures/stormglass_normalized_response_3_hours.json';
import * as HTTPUtil from '@src/util/request';

jest.mock('@src/util/request');

describe('StormGlass client', () => {
  //juntando o tipo jets com o  tipo axios para  utilizas as propriedades no ts mockedAxios.get.mockResolvedValue - inferencia de tipos?
  //const mockedAxios = axios as jest.Mocked<typeof axios>;  - typeof static

  //mocando o requestError   typeof por ser statico
  const MockedRequestClass = HTTPUtil.Request as jest.Mocked<
    typeof HTTPUtil.Request
  >;

  const mockedRequest = new HTTPUtil.Request() as jest.Mocked<HTTPUtil.Request>; //sem typeOf por ser instacia

  //resposta ok da requisicao para Api storm glass
  it('should return the normalized forecast from the StormGlass service', async () => {
    const lat = -33.792726;
    const lng = 151.289824;

    /**
     * axios.get = jest.fn().mockResolvedValue({ data: stormglassWeatherPointFixture });
     * const stormGlass = new StormGlass(axios);
     */

    mockedRequest.get.mockResolvedValue({
      data: stormGlassWeather3HoursFixture,
    } as HTTPUtil.Response);
    const stormGlass = new StormGlass(mockedRequest);
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
        },
      ],
    };

    mockedRequest.get.mockResolvedValue({
      data: incompleteResponse,
    } as HTTPUtil.Response);

    const stormGlass = new StormGlass(mockedRequest);
    const response = await stormGlass.fetchPoints(lat, lng);

    expect(response).toEqual([]);
  });

  //resposta para erro na requisição antes de chegar na API storm glass
  it('should get a generic error from StormGlass service when the request fail before reaching the service', async () => {
    const lat = -33.792725;
    const lng = 151.289824;

    mockedRequest.get.mockRejectedValue({ message: 'Network Error' });

    const stormGlass = new StormGlass(mockedRequest);

    await expect(stormGlass.fetchPoints(lat, lng)).rejects.toThrow(
      'Unexpected error when trying to communicate to StormGlass: Network Error'
    );
  });

  //resposta pra erro na resposta do servidor da API storm glass
  it('should get an StormGlassResponseError when the StormGlass service with error', async () => {
    const lat = -33.792725;
    const lng = 151.289824;

    MockedRequestClass.isRequestError.mockReturnValue(true);

    mockedRequest.get.mockRejectedValue({
      response: {
        status: 429,
        data: { errors: ['Rate limit reached'] },
      },
    });

    const stormGlass = new StormGlass(mockedRequest);

    await expect(stormGlass.fetchPoints(lat, lng)).rejects.toThrow(
      'Unexpected error returned by the StormGlass service: Error: {"errors":["Rate limit reached"]} Code: 429'
    );
  });
});
