window.onload = function()
{
    var canvasWidth = 900;
    var canvasHeight = 600;
    var context;
    var blockSize = 30;
    var delay = 100; 
    var snackee;
    var applee;
    var widthInBlock = canvasWidth / blockSize;
    var heightInBlock = canvasHeight / blockSize;
    var score;
    var timeOut;

    init();

    function init()
    {  // On créer notre cadre fixe pour le dessin de taille canvasWidth et canvasHeight
       var canvas = document.createElement('canvas');
       canvas.width = canvasWidth;
       canvas.height = canvasHeight;
       canvas.style.border = '30px solid grey';
       canvas.style.margin = '50px auto';
       canvas.style.display = 'block';
       canvas.style.backgroundColor = "#ddd";
       document.body.appendChild(canvas);
       context = canvas.getContext('2d');
       snackee = new Snake([[6,4],[5,4],[4,4],[3,4],[2,4],[1,4]],"right");
       applee = new Apple([10,10]);
       score = 0;
       refrechCanvas();
    }

    function refrechCanvas()
    {
        snackee.advance();
        //on nettoie le rectangle précédent aprés en avoir déssiner un autre pour avoir l'effet de mouvement
        if(snackee.checkCollision())
        {
            gameOver();
        }
        else
        {
            if(snackee.isEatingApple(applee))
            {
                score++;
                //oui le serpent a mangé une pomme, on active l'agrandissement du serpent
                snackee.isEatApple = true;
                do 
                {
                    applee.setNewPosition();
                } 
                while (applee.isOnSnacke(snackee));    
            }
            context.clearRect(0,0, canvasWidth, canvasHeight);
            drawScore();
            //on dessine le score avant pour que le serpent puisse passer dessus et non en dessous
            snackee.draw();
            applee.draw();
            // fonction qui permet d'executer une fonction en boucle à chaque fois que le délais est passé
            timeOut = setTimeout(refrechCanvas,delay);
        }
    }

    function gameOver()
    {
        context.save();
        context.font = "bold 70px sans-serif ";
        context.fillStyle = "black";
        context.textAlign = "center";
        context.textBaseline = "middle";
        context.strokeStyle = "white";
        context.lineWidth = 5;
        var centerX = canvasWidth / 2;
        var centerY = canvasHeight / 2;
        context.strokeText("Game Over", centerX, centerY-180);
        context.fillText("Game Over", centerX, centerY-180);
        context.font = "bold 30px sans-serif ";
        context.strokeText("Appuyer sur la touche Espace pour rejouer", centerX, centerY-120);
        context.fillText("Appuyer sur la touche Espace pour rejouer", centerX, centerY-120);
        context.restore();
    }

    function restart()
    {
        snackee = new Snake([[6,4],[5,4],[4,4],[3,4],[2,4]],"right");
        applee = new Apple([10,10]);
        score = 0;
        //permet de stopper le refrechCanvas lorsque qu'on tape sur la touche espace alors que la partie n'est pas fini, si on arrete pas le serpent augmente de vitesse puisqu'un second refrech est en cours d'execution soit 2* 10 tours / seconde
        clearTimeout(timeOut);
        refrechCanvas();

    }
    function drawScore()
    {
        context.save();
        context.font = "bold 200px sans-serif ";
        context.fillStyle = "grey";
        context.textAlign = "center";
        //pour placer la base du texte au centre x et y
        context.textBaseline = "middle";
        // centre du canvas
        var centerX = canvasWidth / 2;
        var centerY = canvasHeight / 2;
        context.fillText(score.toString(), centerX, centerY);
        context.restore();
    }

    function drawBlock (context, position)
    {
        // on récupére x et y de chacun des éléments du tableau body snake qu'on multiplie à la taille d'un pixel ici 30px, chacun des éléments à la suite [[x*px,y*px],[x2*px,y2px], ...] constitue le serpent
        var x = position[0] * blockSize;
        var y = position[1] * blockSize;
        //on dessine chaque rectangle qui forme le serpent avec la taille du pixel
        context.fillRect(x, y, blockSize, blockSize);
    }

    function Snake(body, direction)
    {
        // le body est un tableau de position x et y pour chacun des blocks du serpent
        this.body = body;
        this.direction = direction;
        //initialement à false sinon le serpent grandirait de suite
        this.isEatApple = false;

        // Pour déssiner le serpent on sauvegarde ça position initial x et y, on modifie les block du serpent càd une nouvelle position x et y, puis on restaure la nouvelle version du serpent et on boucle sur tous les éléments x et y du serpent
        this.draw = function()
        {
            context.save();
            context.fillStyle = "red";
            for(var i=0; i < this.body.length ; i++)
            {
                drawBlock(context, this.body[i]);
            }
            context.restore();
        };

        // Pour faire avancer le serpent on duplique la tête et on efface la queu
        this.advance = function()
        {
            var nextPosition = this.body[0].slice();
            switch (this.direction) 
            {
                // mouvement suivant x
                case "right":
                    nextPosition[0]++;
                    break;
                case "left":
                    nextPosition[0]--;
                    break;
                //mouvement suivant y
                case "up":
                    nextPosition[1]--;
                    break;

                case "down":
                    nextPosition[1]++;
                    break;            
                default:
                    throw("Invalid Direction");
            }
            //ajout du nouveau mouvement x,y au tableau (nouvelle position de la tête du serpent)
            this.body.unshift(nextPosition);
            //si le serpent à manger la pomme isEatApple = true donc l'expression est fausse et le .pop n'est pas executer, comme on enléve plus le dernier élément, le serpent grandit
            if(!this.isEatApple)
            {
                //on supprime le dernier élément du tableau (queu du serpent)
                this.body.pop();
            }
            //si le serpent n'a pas manger la pomme isEatAplle = false donc l'expression est vrai et .pop supprime le dernier élément
            else
            {
                this.isEatApple = false;
            }
        };

        this.setDirection = function(newDirection)
        {
            //direction possible en fonction de ma position actuelle
            var allowedDirections;
            switch(this.direction)
            {  // si le serpent se déplace à droite ou à gauche, il peut soit descendre soit monter
                case "right":
                case "left":
                    allowedDirections = ["up","down"];
                    break;
                case "up":
                case "down":
                    allowedDirections = ["right","left"]
                    break;            
                default:
                    throw("Invalid Direction");
            }
            //index de nextPosition = 0 ou 1 et return -1 si il n'existe pas
            if (allowedDirections.indexOf(newDirection) > -1) 
            {
                this.direction = newDirection;
                
            }
        };

        this.checkCollision = function()
        {
            var wallCollision = false;
            var snackeCollision = false;
            var headSnacke = this.body[0];
            //copy du body en elevant le 1er élément
            var restSnacke = this.body.slice(1);
            var snackeX = headSnacke[0];
            var snackeY = headSnacke[1];
            var Xmin = 0;
            var Ymin = 0;
            var Xmax = widthInBlock - 1;
            var Ymax = heightInBlock - 1;
            var isWallCollisionX = snackeX > Xmax || snackeX < Xmin;
            var isWallCollisionY = snackeY > Ymax || snackeY < Ymin;

            //Colision avec un des murs
            if (isWallCollisionX || isWallCollisionY)
            {
                wallCollision = true;
            }
            //Le serpent s'est mordu, x et y de la tête est à la même position x et y du reste du corps du serpent
            for(i=0; i<restSnacke.length; i++)
            {
                if (snackeX === restSnacke[i][0] && snackeY === restSnacke[i][1]) 
                {
                    snackeCollision = true;
                }
            }

            return wallCollision || snackeCollision;

        };
        this.isEatingApple = function(appleToEat)
        {
            var headSnacke = this.body[0];
            if(headSnacke[0] === appleToEat.position[0] && headSnacke[1] === appleToEat.position[1])
            return true;
            else
            return false;
        };
    }

    function Apple(position)
    {
        this.position = position;
        this.draw = function()
        {
            context.save();
            context.fillStyle = "green";
            context.beginPath();
            //avoir en tête le cadrillage, position x et y qu'on multiplie à blocksize pour l'avoir en pixel auquel on ajoute le rayon pour l'avoir au centre
            var radius = blockSize/2;
            var x = this.position[0]*blockSize + radius;
            var y = this.position[1]*blockSize + radius;
            context.arc(x, y, radius, 0, Math.PI * 2, true);
            context.fill();
            context.restore();
        };
        // On positionne de façon aléatoire la pomme sur le canvas
        this.setNewPosition = function()
        {
            var newX = Math.round(Math.random() * (widthInBlock - 1));
            var newY = Math.round(Math.random()* (heightInBlock - 1));
            this.position = [newX,newY];
        };
        // Au repositionnement,il faut s'assurer que la pomme n'est pas placé sur le serpent
        this.isOnSnacke = function(snackToCheck)
        {
            var isOnSnacke = false;

            for(var i=0; i<snackToCheck.length; i++ )
            {
                if(this.position[0] === snackToCheck.body[i][0] && this.position[1] === snackToCheck.body[i][1])
                {
                    isOnSnacke = true;
                }
            }
            return isOnSnacke;

        };

    }

    

    //On associe les mvt du serpent à la navigation fléchés du clavier
    document.onkeydown = function handleKeydown(event)
    {
        var key = event.key;
        var newDirection;
        switch (key) 
        {
            case "ArrowDown":
                newDirection = "down";
                break;
            case "ArrowLeft":
                newDirection = "left";
                break;
            case "ArrowRight":
                newDirection = "right";
                break;
            case "ArrowUp":
                newDirection = "up";
                break;
            case " ":
                restart();
                return;    
            default:
                return;
        }
        snackee.setDirection(newDirection);
    }
}