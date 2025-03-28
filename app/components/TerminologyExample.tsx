"use client";

import React from 'react';
import ExpandableDefinition from './ExpandableDefinition';

const TerminologyExample: React.FC = () => {
  return (
    <div className="max-w-2xl mx-auto p-6 bg-white dark:bg-slate-900 rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-4 text-slate-900 dark:text-white">
        Example Legal Text
      </h1>
      
      <div className="prose prose-slate dark:prose-invert">
        <p className="mb-4">
          Prowadzenie pojazdów w stanie <ExpandableDefinition term="nietrzeźwości">
            <strong>Stan nietrzeźwości</strong> - stan, w którym zawartość alkoholu we krwi przekracza 0,5 promila albo prowadzi do 
            stężenia przekraczającego tę wartość lub zawartość alkoholu w 1 dm³ wydychanego powietrza przekracza 0,25 mg 
            albo prowadzi do stężenia przekraczającego tę wartość.
          </ExpandableDefinition> po raz pierwszy stało się przedmiotem zainteresowania ustawodawcy w 1928 r.
        </p>
        
        <p className="mb-4">
          Mimo że akt ten utracił moc obowiązującą w 1933 r., to <ExpandableDefinition term="zakaz prowadzenia pojazdu">
            <strong>Zakaz prowadzenia pojazdu</strong> - środek karny stosowany wobec osób, które prowadziły pojazd w stanie 
            nietrzeźwości, pod wpływem środka odurzającego lub zbiegły z miejsca wypadku. Sąd może orzec zakaz prowadzenia 
            pojazdów określonego rodzaju na okres od 1 roku do 15 lat.
          </ExpandableDefinition> w stanie nietrzeźwym utrzymano.
        </p>
        
        <p className="mb-4">
          W związku z szybkim rozwojem komunikacji, jak również zwiększeniem zagrożenia bezpieczeństwa w ruchu lądowym, w tym 
          także ze strony nietrzeźwych kierowców, przy jednoczesnym braku <ExpandableDefinition term="narzędzi pomiarowych">
            <strong>Narzędzia pomiarowe</strong> - przyrządy służące do pomiaru zawartości alkoholu w organizmie, takie jak:
            <ul className="mt-2 mb-0">
              <li>Alkomaty - urządzenia do pomiaru zawartości alkoholu w wydychanym powietrzu</li>
              <li>Testy krwi - badania laboratoryjne określające stężenie alkoholu we krwi</li>
              <li>Testy śliny - badania pozwalające na wstępne określenie obecności alkoholu lub substancji odurzających</li>
            </ul>
          </ExpandableDefinition>, po II wojnie światowej dostrzeżono potrzebę rozszerzenia zakresu odpowiedzialności.
        </p>
        
        <p className="mb-4">
          Stało się tak poprzez <ExpandableDefinition term="zastąpienie stanu nietrzeźwości zwrotem stan wskazujący na użycie alkoholu">
            <strong>Zmiana terminologii prawnej</strong> - w ewolucji przepisów dotyczących jazdy pod wpływem alkoholu, 
            ustawodawca zdecydował się na zmianę określenia "stan nietrzeźwości" na bardziej precyzyjne "stan wskazujący 
            na użycie alkoholu". Zmiana ta miała na celu umożliwienie stosowania sankcji już przy niższych stężeniach alkoholu, 
            niekoniecznie powodujących pełną nietrzeźwość, ale wpływających na zdolności psychomotoryczne kierowcy.
          </ExpandableDefinition>.
        </p>
      </div>
    </div>
  );
};

export default TerminologyExample; 