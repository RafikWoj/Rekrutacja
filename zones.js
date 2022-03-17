const http = require('http');

const server = http.createServer((req, res) => {
    if (req.url === '/') {

        res.write('<html>');
        res.write('<head><meta charset="utf-8" /></head>');
        res.write('<h2>Strona powitalna programu rekrutacyjnego zwracającego czas w zadanej strefie czasowej...</h2>');
        res.write('<br/>');
        res.write('<br/>');
        res.write('Aby poprawnie wykonać wywołanie, należy użyć konstrukcji: http://localhost:1234/time?zone=[M]dddd.');
        res.write('</html>');
        res.end();
    }
    else if (req.url.startsWith('/time?zone')) {

        process.env.TZ = 'Europe/Warsaw';

        parts = req.url.split('=');
        z = parts[1];

        zone = 'GMT+'
        isDecreasing = false;
        if (z.startsWith('M')) {
            zone = 'GMT-';
            z = z.replace('M', '');
            isDecreasing = true;
        }

        //można zrobić ograniczenie, że tylko w ramach doby zmieniamy strefę, ale można też dodawać/odejmować dni.... tak zrobiłem
        /*if (i > 23 || i < 0) {
            res.write('Parametr musi zawierać się w zakresie [M]0 - [M]23.');
        }
        else*/
        if (isNaN(z)) {
            res.write('<html>');
            res.write('<head><meta charset="utf-8" /></head>');
            res.write('<b>Parametr musi być liczbą całkowitą dodatnią. W przypadku liczb ujemnych zamiast znaku [-] należy użyć litery M.</b>');
            res.write('</html>');
        }
        else
        {
            operationdescription = '';
            i = parseInt(z, 10);
            daystoadd = Math.floor(i / 24);
            if (isDecreasing) {
                daystoadd = daystoadd * (-1);
                operationdescription = 'odjętych';
            }
            else
                operationdescription = 'dodanych';

            //obliczenie liczby godzin z pominięciem przesunięcia w dniach
            z = (i - (24 * Math.abs(daystoadd))).toString();

            daysToAddStr = '';
            if (daystoadd!=0)
                daysToAddStr = ` (liczba ${operationdescription} dni: ${Math.abs(daystoadd)})`;

            if (z.length === 1)
                z = '0' + z;
            zone = zone + z;

            d = new Date();

            //aby zaprezentować, o ile lokalny czas przesunięty jest w stosunku do GMT
            strdate = d.toString();
            pos = strdate.indexOf('GMT');
            localzone = strdate.substring(pos, pos + 6);

            s = '<p> Aktualne data i czas (' + localzone + '): <b>' + d.toLocaleString('pl-pl') + '</b></p>';

            //zmiana strefy czasowej
            process.env.TZ = zone;

            d1 = new Date();
            //dodanie/odjęcie dni wynikające z parametru>23
            d1.setDate(d1.getDate() + daystoadd);

            res.write('<html>');
            res.write('<head><meta charset="utf-8" /></head>');
            res.write('<h1>Data i czas</h1>');
            res.write(s);
            res.write('<p> Data i czas w strefie ' + zone + ': <b>' + d1.toLocaleString('pl-pl')+ '</b>' + daysToAddStr + '</p>');
            res.write('</html>');
        }
        res.end();
    }
});

server.listen('1234');

console.log('Nasłuchuję port 1234....');