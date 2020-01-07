import { InProcessFirestore } from "../../../src/driver/Firestore/InProcessFirestore"

describe("InProcessFirestore create", () => {
    const db = new InProcessFirestore()

    beforeEach(() => {
        db.reset()
    })

    test("create new document", async () => {
        // When we create a new document;
        await db
            .collection("animals")
            .doc("tiger")
            .create({ description: "stripey" })

        // Then the document should be created.
        const snapshot = await db
            .collection("animals")
            .doc("tiger")
            .get()
        expect(snapshot.exists).toBeTruthy()
        expect(snapshot.data()).toEqual({ description: "stripey" })
    })

    test("cannot create existing document", async () => {
        // Given there is an existing document;
        await db
            .collection("animals")
            .doc("tiger")
            .set({ description: "stripey" })

        // When we create the same document;
        let error: Error
        try {
            await db
                .collection("animals")
                .doc("tiger")
                .create({ size: "large" })
        } catch (err) {
            error = err
        }

        // Then the write should fail;
        // @ts-ignore
        expect(error).toBeInstanceOf(Error)

        // And the document should not be changed.
        const snapshot = await db
            .collection("animals")
            .doc("tiger")
            .get()
        expect(snapshot.exists).toBeTruthy()
        expect(snapshot.data()).toEqual({ description: "stripey" })
    })
})
