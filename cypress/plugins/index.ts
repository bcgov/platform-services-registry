import cucumber from 'cypress-cucumber-preprocessor';

export default (on: any, config: any) => {
  on('file:preprocessor', cucumber());
};
