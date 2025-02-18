import { htmlToLexical } from "@tryghost/kg-html-to-lexical";
import axios from "axios";
import jwt from "jsonwebtoken"


// const ghostAdminAPIkey = "6725d463f07ac21c2754fc9b:9350a1ecc6a0ff7d55d7e5133fec74b4f09fa483ec177c96ce84487de3c97454";



export const publishToGhost=async(ghostAdminAPIkeys:string,html: string, title: string, slug: string, tag: string,excerpt: string,ghostURL:string,postOn:string)=> {
    try {
        if(postOn==="ghost"){
          const ghostAdminAPIkey = ghostAdminAPIkeys;
          const [id, secret] = ghostAdminAPIkey.split(':');
          const token =jwt.sign({}, Buffer.from(secret, 'hex'), {
              keyid: id,
              algorithm: 'HS256',
              expiresIn: '5m',
              audience: `/admin/`
            });
          const lexicalDataObject = await htmlToLexical(html);
          const lexicalData = JSON.stringify(lexicalDataObject)
          const payload = {
              status: "draft",
              lexical: lexicalData,
              title: title,
              slug: slug,
              custom_excerpt: excerpt,
              tags: [{ name: "c-buzz" }],
              authors: [
                  {
                      slug: 'legal-wires'
                  }
              ]
          }
          console.log("gl",ghostURL)
          console.log("token",token)
          console.log("payload",payload )
          const feedData = await axios.post(`https://btcwires.com/ghost/api/admin/posts/`, { posts: [payload] }, {
              headers: {
                  Authorization: `Ghost ${token}`
              }
          });

          console.log("Response is >>>>>>>>>>>>>> ", feedData)
        }else{
          console.log("Wordpress")
        }
    } catch (error) {
      console.log("Error is >>>>> ",error)
      console.log("Error is <<<<< ",JSON.stringify(error))

      throw new Error(error)
      
    }
}