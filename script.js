document.addEventListener('DOMContentLoaded', () => {
    const blob = document.getElementById('blob');
    const laughSound = document.getElementById('laughSound');
    const beachSound = document.getElementById('beachSound');
    
    // Get actual blob dimensions after loading
    let blobWidth, blobHeight;
    
    // Wait for the blob image to load to get correct dimensions
    if (blob.complete) {
        blobWidth = blob.offsetWidth;
        blobHeight = blob.offsetHeight;
        initBlob();
    } else {
        blob.onload = () => {
            blobWidth = blob.offsetWidth;
            blobHeight = blob.offsetHeight;
            initBlob();
        };
    }
    
    function initBlob() {
        // Set initial position
        let x = Math.random() * (window.innerWidth - blobWidth);
        let y = Math.random() * (window.innerHeight - blobHeight);
        
        // Set initial velocity
        let vx = Math.random() * 2 - 1; // -1 to 1
        let vy = Math.random() * 2 - 1; // -1 to 1
        
        // Normalize velocity for consistent speed
        const normalSpeed = 1.2; // Further reduced for smoother motion
        const length = Math.sqrt(vx * vx + vy * vy);
        vx = (vx / length) * normalSpeed;
        vy = (vy / length) * normalSpeed;
        
        let isEscaping = false;
        let escapeTimer = 0;
        let escapeSpeed = 6; // Reduced for smoother escaping
        
        // Variables for natural swimming
        let targetX = Math.random() * (window.innerWidth - blobWidth);
        let targetY = Math.random() * (window.innerHeight - blobHeight);
        let changeTargetCounter = 0;
        const changeTargetFrequency = 300; // 5 seconds for even smoother transitions
        
        // Update blob position
        function updatePosition() {
            // Natural swimming - move toward a target point
            changeTargetCounter++;
            if (changeTargetCounter >= changeTargetFrequency) {
                changeTargetCounter = 0;
                // Set new target within bounds, but not too far from current position
                const maxDistance = Math.min(window.innerWidth, window.innerHeight) * 0.25; // 25% of screen
                const angle = Math.random() * Math.PI * 2;
                const distance = Math.random() * maxDistance;
                
                // Calculate new target relative to current position
                let newTargetX = x + Math.cos(angle) * distance;
                let newTargetY = y + Math.sin(angle) * distance;
                
                // Make sure target is within bounds
                newTargetX = Math.max(blobWidth * 0.5, Math.min(window.innerWidth - blobWidth * 1.5, newTargetX));
                newTargetY = Math.max(blobHeight * 0.5, Math.min(window.innerHeight - blobHeight * 1.5, newTargetY));
                
                targetX = newTargetX;
                targetY = newTargetY;
            }
            
            // If not escaping, gradually adjust velocity toward target
            if (!isEscaping) {
                // Calculate direction to target
                const dx = targetX - x;
                const dy = targetY - y;
                const distToTarget = Math.sqrt(dx * dx + dy * dy);
                
                // Gradually adjust velocity toward target with extremely smooth transitions
                if (distToTarget > 5) {
                    // Super smooth adjustment (99% old velocity, 1% new direction)
                    vx = vx * 0.99 + (dx / distToTarget) * 0.01 * normalSpeed;
                    vy = vy * 0.99 + (dy / distToTarget) * 0.01 * normalSpeed;
                    
                    // No random movement - completely smooth
                    
                    // Normalize to maintain consistent speed
                    const currentLength = Math.sqrt(vx * vx + vy * vy);
                    if (currentLength > 0) {
                        vx = (vx / currentLength) * normalSpeed;
                        vy = (vy / currentLength) * normalSpeed;
                    }
                }
            }
            
            // Check window boundaries
            const margin = 20; // Larger margin to prevent any edge issues
            if (x + blobWidth >= window.innerWidth - margin) {
                x = window.innerWidth - blobWidth - margin;
                vx = -Math.abs(vx) * 0.7; // Smoother bounce
                targetX = Math.min(targetX, x - blobWidth);
            } else if (x <= margin) {
                x = margin;
                vx = Math.abs(vx) * 0.7; // Smoother bounce
                targetX = Math.max(targetX, x + blobWidth);
            }
            
            if (y + blobHeight >= window.innerHeight - margin) {
                y = window.innerHeight - blobHeight - margin;
                vy = -Math.abs(vy) * 0.7; // Smoother bounce
                targetY = Math.min(targetY, y - blobHeight);
            } else if (y <= margin) {
                y = margin;
                vy = Math.abs(vy) * 0.7; // Smoother bounce
                targetY = Math.max(targetY, y + blobHeight);
            }
            
            // Handle escape mode
            if (isEscaping) {
                escapeTimer++;
                if (escapeTimer >= 120) { // 2 seconds at 60fps
                    isEscaping = false;
                    escapeTimer = 0;
                    // Reset target after escaping
                    targetX = x + (Math.random() * 200 - 100); // Target near current position
                    targetY = y + (Math.random() * 200 - 100);
                    
                    // Keep target within bounds
                    targetX = Math.max(blobWidth * 0.5, Math.min(window.innerWidth - blobWidth * 1.5, targetX));
                    targetY = Math.max(blobHeight * 0.5, Math.min(window.innerHeight - blobHeight * 1.5, targetY));
                } else if (escapeTimer > 60) {
                    // Gradually slow down in the second half - extra smooth
                    escapeSpeed = escapeSpeed * 0.98;
                }
            }
            
            // Apply velocity
            const currentSpeed = isEscaping ? escapeSpeed : normalSpeed;
            x += vx * (currentSpeed / normalSpeed);
            y += vy * (currentSpeed / normalSpeed);
            
            // Apply position (with safety bounds check)
            x = Math.max(margin, Math.min(window.innerWidth - blobWidth - margin, x));
            y = Math.max(margin, Math.min(window.innerHeight - blobHeight - margin, y));
            
            // Apply position only, no additional transforms or rotations
            blob.style.left = `${x}px`;
            blob.style.top = `${y}px`;
            
            requestAnimationFrame(updatePosition);
        }
        
        // Start animation
        updatePosition();
        
        // Handle blob interaction
        blob.addEventListener('click', handleBlobClick);
        blob.addEventListener('touchstart', (e) => {
            e.preventDefault();
            handleBlobClick();
        });
        
        function handleBlobClick() {
            // Play sounds
            laughSound.currentTime = 0;
            laughSound.play().catch(e => console.log('Audio play error:', e));
            
            if (beachSound.paused) {
                beachSound.play().catch(e => console.log('Audio play error:', e));
            }
            
            // Make blob escape
            isEscaping = true;
            escapeTimer = 0;
            escapeSpeed = 6; // Reduced for smoother escaping
            
            // Change direction randomly - away from current position but smoother
            const angle = Math.random() * Math.PI * 2;
            vx = Math.cos(angle) * normalSpeed * 1.5;
            vy = Math.sin(angle) * normalSpeed * 1.5;
        }
        
        // Handle window resize
        window.addEventListener('resize', () => {
            // Keep blob within new window boundaries
            x = Math.max(margin, Math.min(window.innerWidth - blobWidth - margin, x));
            y = Math.max(margin, Math.min(window.innerHeight - blobHeight - margin, y));
            
            // Update blob dimensions
            blobWidth = blob.offsetWidth;
            blobHeight = blob.offsetHeight;
            
            // Update target position if out of bounds
            targetX = Math.max(margin, Math.min(window.innerWidth - blobWidth - margin, targetX));
            targetY = Math.max(margin, Math.min(window.innerHeight - blobHeight - margin, targetY));
        });
    }
}); 