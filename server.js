const express = require('express');
const { spawn } = require('child_process');
const app = express();
app.use(express.json());

app.post('/shortestpath', (req, res) => {
    const { n, m, edges, src, dest } = req.body;

    if (!n || !m || !edges || src === undefined || dest === undefined) {
        return res.status(400).json({ error: 'Missing fields' });
    }

    // Build input string
    let input = `${n} ${m}\n`;
    for (let e of edges) {
        input += `${e[0]} ${e[1]} ${e[2]}\n`;
    }
    input += `${src} ${dest}\n`;

    const child = spawn('./algorithm.exe');

    let stdout = '';
    let stderr = '';

    child.stdout.on('data', (data) => { stdout += data.toString(); });
    child.stderr.on('data', (data) => { stderr += data.toString(); });

    child.on('close', (code) => {
        if (code !== 0) {
            return res.status(500).json({ error: stderr || 'Process failed' });
        }

        const lines = stdout.trim().split('\n');
        if (lines[0].includes('No path')) {
            return res.json({ found: false, distance: -1, path: [] });
        }

        const distance = parseInt(lines[0].split(':')[1].trim());
        const path = lines[1].split(':')[1].trim().split(' ').map(Number);

        res.json({ found: true, distance, path });
    });

    child.stdin.write(input);
    child.stdin.end();
});

app.listen(8080, () => {
    console.log('Server running on http://localhost:8080');
});