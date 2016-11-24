/** @flow */

export default class Open {
  name = 'open';
  description = 'open a bit in your default text editor';
  alias = 'o';
  opts = [];

  action(params: Object[]): Promise<any> {
    console.log('opening bit...');
    this.name = '';
    return new Promise((resolve) => {
      resolve(params);
    });
  }
}