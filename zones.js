const http = require('http');

const server = http.createServer((req, res) => {
    if (req.url === '/') {

        d = new Date();
        res.write(d.toString());
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

        //mo�na zrobi� ograniczenie, �e tylko w ramach doby zmieniamy stref�, ale mo�na te� dodawa�/odejmowa� dni.... tak zrobi�em
        /*if (i > 23 || i < 0) {
            res.write('Parametr musi zawiera� si� w zakresie [M]0 - [M]23.');
        }
        else*/
        if (isNaN(z)) {
            res.write('Parametr musi by� liczb� ca�kowit� dodatni� lub liczb� ca�kowit� poprzedzon� znakiem M dla liczb ujemnych.');
        }
        else
        {
            operationdescription = '';
            i = parseInt(z, 10);
            daystoadd = Math.floor(i / 24);
            if (isDecreasing) {
                daystoadd = daystoadd * (-1);
                operationdescription = 'odj�tych';
            }
            else
                operationdescription = 'dodanych';

            //obliczenie liczby godzin z pomini�ciem przesuni�cia w dniach
            z = (i - (24 * Math.abs(daystoadd))).toString();

            daysToAddStr = '';
            if (daystoadd!=0)
                daysToAddStr = ` (liczba ${operationdescription} dni: ${Math.abs(daystoadd)})`;

            if (z.length === 1)
                z = '0' + z;
            zone = zone + z;

            d = new Date();

            //aby zaprezentowa�, o ile lokalny czas przesuni�ty jest w stosunku do GMT
            strdate = d.toString();
            pos = strdate.indexOf('GMT');
            localzone = strdate.substring(pos, pos + 6);

            s = '<p> Aktualne data i czas (' + localzone + '): <b>' + d.toLocaleString('pl-pl') + '</b></p>';

            //zmiana strefy czasowej
            process.env.TZ = zone;

            d1 = new Date();
            //dodanie/odj�cie dni wynikaj�ce z parametru>23
            d1.setDate(d1.getDate() + daystoadd);

            res.write('<html>');
            res.write('<h1>Data i czas</h1>');
            res.write(s);
            res.write('<p> Data i czas w strefie ' + zone + ': <b>' + d1.toLocaleString('pl-pl')+ '</b>' + daysToAddStr + '</p>');
            res.write('</html>');
        }


        res.end();
    }
});

server.listen('1234');

console.log('Nas�uchuj� port 1234....');