function generate_unique_code() {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

    code = '';
    for (let i = 0; i < 5; i++) {
        const randomIndex = Math.floor(Math.random() * characters.length);
        code += characters.charAt(randomIndex);
    }
    document.getElementById('generate').value = code;
}