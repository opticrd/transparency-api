import { HttpException, Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { load } from 'cheerio';

@Injectable()
export class ComptrollerService {
  constructor(private readonly httpService: HttpService) {}

  async getData(cedula: number) {
    return new Promise((res, rej) => {
      this.httpService
        .get('/extranet/ConsultaGBCE/Create/' + cedula)
        .subscribe({
          next: ({ data }) => {
            const selector = load(data);
            const rows = selector('table').find('tbody > tr > td');

            const response = {
              valid: true,
              data: {
                cedula: selector(rows[0]).text().trim(),
                name: selector(rows[1]).text().trim(),
                employer: selector(rows[2]).text().trim(),
                institution: selector(rows[3]).text().trim(),
                salary: selector(rows[4]).text().trim(),
                account: selector(rows[5]).text().trim(),
              },
            };

            return res(response);
          },
          error: (err) => {
            const status = (err.response && err.response.status) || 500;

            rej(
              new HttpException({ valid: false, message: err.message }, status),
            );
          },
        });
    });
  }
}
