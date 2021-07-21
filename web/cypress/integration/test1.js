describe('Cypress Test 1', () => {
  it('This is a placeholder test', () => {
    cy.visit('http://localhost:3000/dashboard')
    cy.contains('Login').click()
  })
})
