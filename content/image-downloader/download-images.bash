#!/bin/bash

[ -f "../images/large-cards/84701927-799f-4af4-85b8-389f903c5bc0.jpg" ] && echo "skipping 84701927-799f-4af4-85b8-389f903c5bc0" || (wget "https://cards.scryfall.io/large/front/8/4/84701927-799f-4af4-85b8-389f903c5bc0.jpg" -O "../images/large-cards/84701927-799f-4af4-85b8-389f903c5bc0.jpg" && sleep 1)
[ -f "../images/large-cards/fba20e7e-9581-4a9b-bdda-5c85d3450d4c.jpg" ] && echo "skipping fba20e7e-9581-4a9b-bdda-5c85d3450d4c" || (wget "https://cards.scryfall.io/large/front/f/b/fba20e7e-9581-4a9b-bdda-5c85d3450d4c.jpg" -O "../images/large-cards/fba20e7e-9581-4a9b-bdda-5c85d3450d4c.jpg" && sleep 1)
