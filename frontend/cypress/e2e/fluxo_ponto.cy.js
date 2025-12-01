describe('Fluxo de Registro de Ponto', () => {
    it('Deve realizar login e registrar ponto com sucesso', () => {
        // Mock da geolocalização antes de carregar a página
        const latitude = -15.7942;
        const longitude = -47.8821;

        cy.visit('/', {
            onBeforeLoad(win) {
                cy.stub(win.navigator.geolocation, 'getCurrentPosition').callsFake((cb) => {
                    return cb({
                        coords: {
                            latitude,
                            longitude,
                            accuracy: 10,
                        },
                    });
                });
            },
        });

        // Fluxo de Login
        // Ajuste os seletores conforme a implementação real
        cy.get('input[type="email"]').type('teste@nexora.com');
        cy.get('input[type="password"]').type('123456');
        cy.get('button[type="submit"]').click();

        // Redirecionamento para Dashboard
        cy.url().should('include', '/dashboard');

        // Clicar em "Registrar Ponto"
        cy.contains('Registrar Ponto').click();

        // Validar Toast de Sucesso
        // Ajuste o texto ou seletor conforme a mensagem real do sistema
        cy.contains('Ponto registrado com sucesso').should('be.visible');
    });
});
