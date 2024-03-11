document.addEventListener("DOMContentLoaded", function() {
    const canvas = document.getElementById('particleCanvas');
    const ctx = canvas.getContext('2d');
    const width = canvas.width = window.innerWidth;
    const height = canvas.height = window.innerHeight;

    let particles = [];
    let groups = new Set();

    class Particle {
        constructor() {
            this.x = Math.random() * width;
            this.y = Math.random() * height;
            this.velocity = { x: (Math.random() - 0.5) * 2, y: (Math.random() - 0.5) * 2 };
            this.group = false;
            this.debuffTimer = 0;
            this.color = 'white';
        }

        update() {

            if (!this.group) {
                this.x += this.velocity.x;
                this.y += this.velocity.y;


                if (this.x <= 0 || this.x >= canvas.width) this.velocity.x *= -1;
                if (this.y <= 0 || this.y >= canvas.height) this.velocity.y *= -1;
            }


            if (!this.group && this.debuffTimer <= 0) {
                for (let other of particles) {
                    if (other !== this && !this.group && !other.group && Math.hypot(this.x - other.x, this.y - other.y) < 50) {
                        const midpoint = { x: (this.x + other.x) / 2, y: (this.y + other.y) / 2 };
                        const group = new Group(midpoint);
                        group.addParticle(this);
                        group.addParticle(other);
                        groups.add(group);
                    }
                }
            } else if (this.debuffTimer > 0) {
                this.debuffTimer--;
            }
        }

        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, 5, 0, 2 * Math.PI);
            ctx.fillStyle = this.color;
            ctx.fill();
        }
    }

    class Group {


        constructor(midpoint) {
            this.x = midpoint.x;
            this.y = midpoint.y;
            this.velocity = { x: (Math.random() - 0.5) * 2, y: (Math.random() - 0.5) * 2 };
            this.midpoint = midpoint;
            this.particles = [];
            this.decay = Math.random() * 10;
            this.virtualBox = { x: midpoint.x - 150, y: midpoint.y - 150, width: 300, height: 300 };
            this.groupColor = `rgb(${Math.random() * 255}, ${Math.random() * 255}, ${Math.random() * 255})`;

            // this.other = this.particles.find(p => p !== this);
            // this.attractionForce = { x: (this.other.x - this.x) * 0.01, y: (this.other.y - this.y) * 0.01 }; // Adjust the multiplier for stronger/weaker attraction
        }



        checkDecay() {
            this.particles.forEach(particle => {
                particle.debuffTimer = Math.random() * 1000;
                particle.group = null;
                particle.color = 'white'; // Reset color or set to default
            });
            groups.delete(this);
        }

        addParticle(particle) {
            this.particles.push(particle);
            particle.group = this;
            particle.color = this.groupColor;
        }

        update() {
            this.midpoint.x += this.velocity.x;
            this.midpoint.y += this.velocity.y;

            if (this.midpoint.x <= 0 || this.midpoint.x >= canvas.width) this.velocity.x *= -1;
            if (this.midpoint.y <= 0 || this.midpoint.y >= canvas.height) this.velocity.y *= -1;



            this.particles.forEach(particle => {
                // this.velocity.x += this.attractionForce.x + (Math.random() - 0.5) * 0.1; // Add random motion
                // this.velocity.y += this.attractionForce.y + (Math.random() - 0.5) * 0.1; // Adjust the random factor for more/less deviation

                particle.x += this.velocity.x - (Math.random() - 0.5) * 2;
                particle.y += this.velocity.y - (Math.random() - 0.5) * 2;

                if (particle.x <= 0 || particle.x >= this.virtualBox.width) particle.velocity.x *= -1;
                if (particle.y <= 0 || particle.y >= this.virtualBox.height) particle.velocity.y *= -1;
            });



            this.decay -= 0.01;
            if (this.decay <= 0) {
                this.checkDecay();
            }
        }

        drawLine() {
            if (this.particles.length === 2) { // Check if the group has exactly two particles
                ctx.beginPath();
                ctx.moveTo(this.particles[0].x, this.particles[0].y); // Start point: first particle
                ctx.lineTo(this.particles[1].x, this.particles[1].y); // End point: second particle
                ctx.strokeStyle = this.groupColor; // Use the group's color for the line
                ctx.lineWidth = 2; // Line width (adjust as needed)
                ctx.stroke(); // Draw the line
            }
        }

    }

    function init() {
        for (let i = 0; i < 50; i++) {
            particles.push(new Particle());
        }
        animate();
    }

    function animate() {
        ctx.clearRect(0, 0, width, height);
        particles.forEach(particle => {
            particle.update();
            particle.draw();
        });
        groups.forEach(group => {
            group.update();
            group.drawLine();
            if (group.decay <= 0) groups.delete(group); // Efficient removal
        });

        requestAnimationFrame(animate);
    }

    init();
});
