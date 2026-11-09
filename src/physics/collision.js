/**
 * Swept Capsule & AABB Player Physics & Collision Handling
 */

export class CollisionSystem {
  constructor(colliders = []) {
    this.colliders = colliders;
  }

  addColliders(colliders) {
    this.colliders.push(...colliders);
  }

  /**
   * Resolves horizontal position against world colliders
   */
  resolveMovement(currentPos, targetPos, radius = 0.5) {
    let resolved = { x: targetPos.x, y: targetPos.y, z: targetPos.z };

    for (const col of this.colliders) {
      if (col.type === 'AABB') {
        // Only collide if within Y height
        if (targetPos.y + 1.8 > col.minY && targetPos.y < col.maxY) {
          // Check collision on X
          if (
            resolved.x + radius > col.minX &&
            resolved.x - radius < col.maxX &&
            resolved.z + radius > col.minZ &&
            resolved.z - radius < col.maxZ
          ) {
            // Push back to closest safe boundary
            const pushLeft = Math.abs(col.minX - (resolved.x + radius));
            const pushRight = Math.abs(col.maxX - (resolved.x - radius));
            const pushBack = Math.abs(col.minZ - (resolved.z + radius));
            const pushFront = Math.abs(col.maxZ - (resolved.z - radius));

            const minPush = Math.min(pushLeft, pushRight, pushBack, pushFront);
            if (minPush === pushLeft) resolved.x = col.minX - radius;
            else if (minPush === pushRight) resolved.x = col.maxX + radius;
            else if (minPush === pushBack) resolved.z = col.minZ - radius;
            else resolved.z = col.maxZ + radius;
          }
        }
      } else if (col.type === 'CYLINDER') {
        const dx = resolved.x - col.x;
        const dz = resolved.z - col.z;
        const dist = Math.hypot(dx, dz);
        const minDist = col.radius + radius;
        if (dist < minDist && dist > 0.001) {
          const overlap = minDist - dist;
          resolved.x += (dx / dist) * overlap;
          resolved.z += (dz / dist) * overlap;
        }
      }
    }

    return resolved;
  }

  /**
   * Resolves vertical position (floors, stairs, drop fall)
   */
  resolveFloorHeight(pos, currentY) {
    let targetGroundY = 0; // Default natural terrain height

    for (const col of this.colliders) {
      if (col.type === 'STAIR_STEP') {
        if (
          Math.abs(pos.x - col.x) < col.width / 2 + 0.3 &&
          Math.abs(pos.z - col.z) < col.depth / 2 + 0.3
        ) {
          if (col.y > targetGroundY && col.y <= currentY + 0.8) {
            targetGroundY = col.y;
          }
        }
      } else if (col.type === 'FLOOR_PLANE') {
        if (
          pos.x >= col.minX &&
          pos.x <= col.maxX &&
          pos.z >= col.minZ &&
          pos.z <= col.maxZ
        ) {
          // If player is slightly above or near this floor
          if (col.y > targetGroundY && currentY >= col.y - 0.4) {
            targetGroundY = col.y;
          }
        }
      }
    }

    return targetGroundY;
  }
}
