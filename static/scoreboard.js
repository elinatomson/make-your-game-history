const loadScores = data => {
    // Update the tableBody selector to match the HTML structure on the `/scores` page
    const tableBody = document.getElementById('table-body');
    let currentPage = 1;
    let pageSize = 5;
  
    const table = () => {
        //variables which represent the starting and ending indexes of the scores array that should be displayed on the current page.
        const startIndex = (currentPage - 1) * pageSize;
        let endIndex = startIndex + pageSize;
        //new array that contains only the elements of the scores array that should be displayed on the current page.
        let scoresToDisplay = data.slice(startIndex, endIndex);

        // Clear the current contents of the tableBody element
        tableBody.innerHTML = '';

        scoresToDisplay.forEach(player => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${player.name}</td>
                <td>${player.rank}</td>
                <td>${player.score}</td>
                <td>${player.time}</td>
            `;
            tableBody.appendChild(row);

            document.getElementById('sentence').textContent = `Congrats ${player.name}, you are in the top ${player.positionPercent.toFixed(0)}%, on the ${player.rank}${getOrdinalSuffix(player.rank)} position.`;

            function getOrdinalSuffix(num) {
                switch (num % 10) {
                    case 1:
                    if (num % 100 !== 11) {
                        return "st";
                    }
                    break;
                    case 2:
                    if (num % 100 !== 12) {
                        return "nd";
                    }
                    break;
                    case 3:
                    if (num % 100 !== 13) {
                        return "rd";
                    }
                    break;
                    }
                return "th";
            }
        });
    }

    const totalPages = Math.ceil(data.length / pageSize);
    function nextPage() {
        if (currentPage < totalPages) {
            currentPage++;
            table();
        }
    }

    function previousPage() {
        if (currentPage > 1) {
            currentPage--;
            table();
        }
    }

    document.getElementById('nextButton').addEventListener('click', nextPage);
    document.getElementById('prevButton').addEventListener('click', previousPage);

    table();
};

// Fetch the data from the `/scores` endpoint 
fetch('http://localhost:8080/scores')
  .then(response => response.json())
  .then(loadScores);