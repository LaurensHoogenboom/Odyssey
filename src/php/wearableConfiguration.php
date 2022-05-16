<!-- Wearable configuration -->

<div class="ui-container hidden depth-border" id="bluetooth-menu">
    <div class="content">
        <h1>Odyssey</h1>

        <section id="connection-section">
            <h2>Klik hieronder om met te verbinden met de wearable.</h2>
            <label id="connect" class="button depth-border">Verbinden</label>
            <label id="disconnect" class="button depth-border hidden">Verbinding verbreken</label>

            <div class="bluetooth-interface hidden">
                <div id="terminal">
                    <div>Device connection...</div>
                    <div class="out">Outcoming message</div>
                    <div class="in">Incoming message</div>
                </div>

                <form id="send-form">
                    <input type="text" id="input" />
                    <input type="submit" value="submit" />
                </form>
            </div>
        </section>

        <section id="belt-section" class="hidden">
            <h2>Doe de riem om. Zorg ervoor dat hij niet te los zit.</h2>
            <label id="start-sensor-configuration" class="button depth-border">Volgende</label>
        </section>

        <section id="stressball-configuration-section" class="hidden">
            <h2>Knijp zo hard mogelijk in de stressbal.</h2>
            <div class="progress-bar depth-border" id="stressbal-progress">
                <div class="filling"></div>
            </div>
        </section>

        <section id="breath-configuration-section" class="hidden">
            <h2 id="breath-configuration-instruction">
                Adem zo ver mogelijk in met je buik. Hou je adem vast tot de balk vol is.
            </h2>
            <div class="progress-bar depth-border" id="breath-progress">
                <div class="filling"></div>
            </div>
        </section>

        <section id="enter-game-section" class="hidden">
            <h2>Alles is klaar!</h2>
            <label id="enter-game" class="button depth-border">Start</label>
        </section>
    </div>

    <p>
        <i> Zorg dat de bluetooth is ingeschakeld en de wearable aan staat. </i>
    </p>
</div>
