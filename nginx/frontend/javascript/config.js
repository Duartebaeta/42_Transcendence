async function loadConfig() {
    const response = await fetch('/.env');
    const text = await response.text();

    const env = {};
    text.split('\n').forEach(line => {
        const [key, value] = line.split('=');
        if (key && value) {
            env[key.trim()] = value.trim();
        }
    });

    window.config = env;
}

loadConfig();
