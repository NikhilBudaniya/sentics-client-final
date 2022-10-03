import math

"""
Das System sendet die aktuelle Weltsicht mit einer Frequenz 10 FPS.
Diese werden mit 4 FPS in der Datenbank gespeichert, andere werden verworfen.
Aus Performancegründen wird der Safety-Score mit 1 FPS ausgewertet
und das jeweils letzte Ereignis einer Zeitsekunde aus der Datenbank verwendet.

timestamp: Zeitsekunde
vehicles: Liste von Fahrzeugkoordinaten
humans: Liste von Menschenkoordinaten

Eine Koordinate ist ein Dictionary mit folgenden Attributen:
    - "id": Zufällig generierte ID. Objekte, die in aufeinanderfolgenden
            Auswertungsframes (1 FPS) die entsprechend ihrer Richtung
            und Geschwindigkeit erwartete Position haben, erhalten dieselbe ID.
    - "kind": "human" oder "vehicle"
    - "x": x-Koordinate in Metern. Aus Sicht des Systems ist 0, 0
           nahe Tor 1 und Tor 2. Für die Darstellung in der Webanwendung werden
           die Koordinaten umgerechnet.
           Die Koordinaten und Richtungsgeschwindigkeiten werden beim Laden
           aus der Datenbank exponentiell geglättet, da die Sensoren ungenaue
           Positionen liefern.
    - "y": y-Koordinate in Metern
    - "dx": x-Richtungsgeschwindigkeit in Metern pro Sekunde
    - "dy": y-Richtungsgeschwindigkeit in Metern pro Sekunde
    - "speed": Geschwindigkeit in km/h anhand dx/dy
    - "distance": Tatsächlich zurückgelegte Distanz seit dem letzten Frame
                  auf Basis ungeglätteter Positionen

Zurückgegeben soll eine Liste von Dictionaries mit folgenden Attributen:
    - "x": x-Koordinate in Metern für die Kernel Density Estimation
           und die Filterung nach ROI
    - "y": y-Koordinate in Metern
    - "kde_weight": Gewichtung für die Kernel Density Estimation
    - "graph_y": Wert der Y-Achse des Graphen und für die Filterung
                 nach Schwellwert
"""
def calculate_safety_score(timestamp, vehicles, humans):
    safety_score_violations = []

    for vehicle in vehicles:
        for human in humans:
            distance_x = vehicle["x"] - human["x"]
            distance_y = vehicle["y"] - human["y"]
            distance = math.sqrt(distance_x ** 2 + distance_y ** 2)
            if distance < 15:
                score = (15.0 - distance) / 15.0
                violation = {
                    "x": human["x"],
                    "y": human["y"],
                    "kde_weight": score,
                    "graph_y": score,
                }
                safety_score_violations.append(violation)
    
    return safety_score_violations