import {Vector3, Quaternion} from "oasis-engine";

export const makeEntities = () => {
    let ids = 0
    const entities = []

    entities.push({
        id: ++ids,
        transform: {
            position: new Vector3(0, 0, 0),
            rotation: new Quaternion(0, 0, 0, 1),
        },
        model: {
            type: 'box',
            size: new Vector3(10, 0.1, 10),
        },
        body: {
            type: 'box',
            size: new Vector3(10, 0.1, 10),
            dynamic: false,
        },
    })

    for (let i = 0; i < 5; i++) {
        for (let j = 0; j < 5; j++) {
            entities.push({
                id: ++ids,
                transform: {
                    position: new Vector3(
                        -2.5 + i + 0.1 * i,
                        Math.floor(Math.random() * 6) + 1,
                        -2.5 + j + 0.1 * j,
                    ),
                    rotation: new Quaternion(0, 0, 0.3, 0.7),
                },
                model: {
                    type: 'box',
                    size: new Vector3(1, 1, 1),
                },
                body: {
                    type: 'box',
                    size: new Vector3(1, 1, 1),
                    dynamic: true,
                },
            })
        }
    }

    return entities
}